const express = require('express');
const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');
const { check, body } = require('express-validator');
const router = express.Router();

router.get('/donor/home/index', isAuth, userController.getHome);
router.get('/donor/schedules/city', isAuth, userController.getUserDonate);
router.post('/donor/schedules/city', isAuth, userController.postSendEmail);
router.get('/donor/appointment/list', isAuth, userController.getUserAppointment);
router.get('/donor/history', isAuth, userController.getUserDonation);
router.get('/donor/rateourstaff', isAuth, userController.getUserRate);
router.get('/donor/store', isAuth, userController.getUserStore);
//router.get('/donor/account/link',isAuth,userController.getAccountLink);


/* Account */

router.get('/donor/account/view', isAuth, userController.getUserAccount);
router.get('/donor/:id', isAuth, userController.getUserById);
router.get('/donor/:id/edit', isAuth, userController.getEditInfo);
router.put('/donor/:id', isAuth, userController.UpdateUser);
router.get('/donor/password/:id/edit', isAuth, userController.getUpdatePassword);
router.put('/donor/password/:id', [
    body('password',
        'The password must be at least 3 characters long.'
    )
        .isLength({ min: 3 })
        .trim(),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match.');
            }
            return true;
        })
], isAuth, userController.UpdatePassword);




module.exports = router;