const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/log-in', authController.getLogIn);

router.post('/log-in',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Invalid password.')
      .isLength({ min: 3 })
      .trim()
  ],
  authController.postLogIn);

router.post('/logout', authController.postlogout);
router.get('/sign-up', authController.getSignUp);

router.post('/sign-up',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .custom((value, { req }) => {
        return User.findOne({
          email: value
        }).then(user => {
          if (user) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      "Password must include one lowercase character, one uppercase character, a number, and a special character."
    )
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
      .isLength({ min: 5 })
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match.');
        }
        return true;
      }),
    check('firstName').isString().trim().escape(),
    check('lastName').isString().trim().escape(),
    check('state').isString().trim().escape(),
    check('city').isString().trim().escape(),
    check('code').isString().trim().escape(),
    check('phoneNumber').isNumeric().trim().escape(),
    check('bloodType').isString().trim().escape()
  ],
  authController.postSignUp);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;