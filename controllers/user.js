const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const City = require("../models/city");
const Donor = require("../models/donor");
const User = require("../models/user");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.getHome = (req, res, next) => {
  res.render("user/userHome", {
    pageTitle: "Main Page",
  });
};

exports.getUserDonate = async (req, res, next) => {
  const searchOptions = {};
  if (req.query.city != null && req.query.city !== "") {
    searchOptions.city = new RegExp(req.query.city, "i");
  }
  try {
    const users = await User.find(searchOptions);
    res.render("user/userDonate", {
      pageTitle: "Search",
      users,
      searchOptions: req.query,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postSendEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "No account with that email found.");
      return res.redirect("/donor/home/index");
    }
    res.redirect("/donor/home/index");
    transporter.sendMail({
      to: req.body.email,
      from: "bloodbankManagementsystem@protonmail.com",
      subject: "Request a blood bag",
      html: `
              <p>Please, go to the hospital * as soon as you need a blood bag of your kind</p>

            `,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getUserAppointment = async (req, res, next) => {
  const currentUser = req.user;
  try {
    const donors = await Donor.find();
    res.render("user/userAppointment", {
      pageTitle: "My Appointment",
      donors,
      currentUser,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getUserDonation = async (req, res, next) => {
  const currentUser = req.user;
  try {
    const donors = await Donor.find();
    res.render("user/userDonations", {
      pageTitle: "MY ACCOUNT",
      donors,
      currentUser,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getUserRate = (req, res, next) => {
  res.render("user/userRateOurStaff", {
    pageTitle: "RATE OUR STAFF",
  });
};

exports.getUserStore = (req, res, next) => {
  res.render("user/userStore", {
    pageTitle: "STORE",
  });
};

/* exports.getAccountLink = (req,res,next) => {
    res.render('user/accountLinke',{
        pageTitle:'Account Linke'
    });
} */

/* Account */

exports.getUserAccount = async (req, res, next) => {
  const currentUser = req.user;
  try {
    const users = await User.find();
    res.render("user/userMyAccount", {
      pageTitle: "MY ACCOUNT",
      users,
      currentUser,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    res.render("user/userMyAccount", {
      user,
      pageTitle: "MY ACCOUNT",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("user/edit-user", {
      user,
      pageTitle: "Edit User",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.UpdateUser = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.params.id);
    user.city = req.body.city;
    user.phoneNumber = req.body.phoneNumber;
    user.bloodType = req.body.bloodType;
    await user.save();
    res.redirect("/donor/account/view");
  } catch (err) {
    if (user == null) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
    res.render("user/edit-user", {
      user,
      errorMessage: "Error updating User",
      pageTitle: "Edit",
    });
  }
};

exports.getUpdatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("user/password", {
      user,
      pageTitle: "My Account",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.UpdatePassword = async (req, res, next) => {
  let user;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(404).render("user/password", {
        pageTitle: "My Account",
        errorMessage: errors.array()[0].msg,
      });
    }
    const password = await bcrypt.hash(req.body.password, 12);
    user = await User.findById(req.params.id);
    user.password = password;
    await user.save();
    res.redirect("/donor/account/view");
} catch (err) {
    if (user == null) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
    res.render("user/edit-user", {
      user,
      errorMessage: errors.array()[0].msg,
      pageTitle: "Edit",
    });
  }
};

/* */
