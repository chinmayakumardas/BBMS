const Donor = require('../models/donor');
const Patient = require('../models/patient');
const Charity = require('../models/charity');
const Needed = require('../models/neededblood');
const Hospital = require('../models/hospital');
const User = require('../models/user');
const Bag = require('../models/bag');
const City = require('../models/city');
const bcrypt = require('bcryptjs');
const Nexmo = require('nexmo');
const sokcetio = require('socket.io');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const getCurrentDate = () => {
  return new Date();
};

/*const handleError = (err) => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
};*/

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: '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'
    }
  }));

//Init Nexmo
const nexmo = new Nexmo({
  apiKey: '191d2595',
  apiSecret: '2rthPYhF9RXQOlfJ'
});

const ITEMS_PER_PAGE = 5;
const paginator = (page, ITEMS_PER_PAGE, totalItems) => {
  return {
    hasItems: totalItems > 0,
    currentPage: page,
    hasNextPage: ITEMS_PER_PAGE * page < totalItems,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: totalItems > 0 ? Math.ceil(totalItems / ITEMS_PER_PAGE) : 1
  };
};


exports.getAddDonor = (req, res, next) => {
  res.render('donor/add-donor', {
    pageTitle: 'Add Donor'
  });
};

exports.postAddDonor = (req, res, next) => {
  const today = getCurrentDate();
  const donorName = req.body.donorName;
  const nationalId = req.body.nationalId;
  const phoneNumber = req.body.phoneNumber
  const donationDay = req.body.donationDay;
  const email = req.body.email;
  const nextDonationDay = req.body.nextDonationDay;
  const address = req.body.address;
  const bloodType = req.body.bloodType;

  const donor = new Donor({
    date: today,
    donorName,
    nationalId,
    phoneNumber,
    donationDay,
    nextDonationDay,
    email,
    bloodType,
    address,
    userId: req.user._id
  });
  donor
    .save()
    .then(result => {
      console.log(today, `Donor created. Date: ${today}. DonorName: ${donorName}`);
      res.redirect('/display-donors');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getDonors = (req, res, next) => {
  const currentUser = req.user;
  const page = parseInt(req.query.page) || 1;
  let totalItems;
  let itemCounterStartInCurrentPage;
  Donor
    .estimatedDocumentCount()
    .then(number => {
      totalItems = number;
      itemCounterStartInCurrentPage = totalItems - ITEMS_PER_PAGE * (page - 1);
      return Donor
        .find()
        .sort({ date: -1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .populate('userId');
    })
    .then(donors => {
      res.render('donor/donors', {
        itemCounterStartInCurrentPage,
        donors,
        pageTitle: 'Donors',
        currentUser,
        paginationObject: paginator(page, ITEMS_PER_PAGE, totalItems)
      });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditDonor = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const donorId = req.params.donorId;
  Donor.findById(donorId)
    .then(donor => {
      if (!donor) {
        return res.redirect('/');
      }
      res.render('donor/edit-donor', {
        pageTitle: 'Edit Donor',
        editing: editMode,
        donor
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditDonor = (req, res, next) => {
  const today = getCurrentDate();
  const donorId = req.body.donorId;
  const updateDonorName = req.body.donorName;
  const updateNationalId = req.body.nationalId;
  const updatePhoneNumber = req.body.phoneNumber
  const upadteDonationDay = req.body.donationDay;
  const updateEmail = req.body.email;
  const updateNextDonationDay = req.body.nextDonationDay;
  const updateAddress = req.body.address;
  const updateBloodType = req.body.bloodType;
  Donor.findById(donorId)
    .then(donor => {
      if (donor.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      donor.donorName = updateDonorName;
      donor.nationalId = updateNationalId;
      donor.phoneNumber = updatePhoneNumber;
      donor.donationDay = upadteDonationDay;
      donor.nextDonationDay = updateNextDonationDay;
      donor.bloodType = updateBloodType;
      donor.email = updateEmail;
      donor.address = updateAddress;
      donor.editDate = today;
      return donor.save()
        .then(result => {
          console.log(today, `Comment edited. Edit Date: ${today}. DonorName: ${updateDonorName}`);
          res.redirect('/display-donors');
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postDeleteDonor = (req, res, next) => {
  const donorId = req.body.donorId;
  Donor.deleteOne({
    _id: donorId,
    userId: req.user._id
  })
    .then(() => {
      console.log(`Donor with id ${donorId} has been deleted.`);
      res.redirect('/display-donors');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/*Start Patient Controller */

exports.getAddPatient = (req, res, next) => {
  res.render('patient/add-patient', {
    pageTitle: 'Add Patient'
  });
};

exports.postAddPatient = (req, res, next) => {
  const today = getCurrentDate();
  const patientName = req.body.patientName;
  const nationalId = req.body.nationalId;
  const phoneNumber = req.body.phoneNumber
  const address = req.body.address;
  const bloodType = req.body.bloodType;

  const patient = new Patient({
    date: today,
    patientName,
    nationalId,
    phoneNumber,
    bloodType,
    address,
    userId: req.user._id
  });
  patient
    .save()
    .then(result => {
      console.log(today, `Patient created. Date: ${today}. DonorName: ${patientName}`);
      res.redirect('/display-patients');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getPatients = (req, res, next) => {
  const currentUser = req.user;
  const page = parseInt(req.query.page) || 1;
  let totalItems;
  let itemCounterStartInCurrentPage;
  Patient
    .estimatedDocumentCount()
    .then(number => {
      totalItems = number;
      itemCounterStartInCurrentPage = totalItems - ITEMS_PER_PAGE * (page - 1);
      return Patient
        .find()
        .sort({ date: -1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .populate('userId');
    })
    .then(patients => {
      res.render('patient/patients', {
        itemCounterStartInCurrentPage,
        patients,
        pageTitle: 'Patients',
        currentUser,
        paginationObject: paginator(page, ITEMS_PER_PAGE, totalItems)
      });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditPatient = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const patientId = req.params.patientId;
  Patient.findById(patientId)
    .then(patient => {
      if (!patient) {
        return res.redirect('/');
      }
      res.render('patient/edit-patient', {
        pageTitle: 'Edit Donor',
        editing: editMode,
        patient
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditPatient = (req, res, next) => {
  const today = getCurrentDate();
  const patientId = req.body.patientId;
  const updatePatientName = req.body.patientName;
  const updateNationalId = req.body.nationalId;
  const updatePhoneNumber = req.body.phoneNumber
  const updateAddress = req.body.address;
  const updateBloodType = req.body.bloodType;
  Patient.findById(patientId)
    .then(patient => {
      if (patient.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      patient.patientName = updatePatientName;
      patient.nationalId = updateNationalId;
      patient.phoneNumber = updatePhoneNumber;
      patient.bloodType = updateBloodType;
      patient.address = updateAddress;
      patient.editDate = today;
      return patient.save()
        .then(result => {
          console.log(today, `Patient edited. Edit Date: ${today}. DonorName: ${updatePatientName}`);
          res.redirect('/display');
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postDeletePatient = (req, res, next) => {
  const patientId = req.body.patientId;
  Patient.deleteOne({
    _id: patientId,
    userId: req.user._id
  })
    .then(() => {
      console.log(`Patient with id ${patientId} has been deleted.`);
      res.redirect('/display-patients');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


/*End Patient Controller */


/*Start Charity Controller */
exports.getAddCharity = (req, res, next) => {
  res.render('charity/add-charity', {
    pageTitle: 'Add Charity'
  });
};

exports.postAddCharity = (req, res, next) => {
  const today = getCurrentDate();
  const charityName = req.body.charityName;
  const phoneNumber = req.body.phoneNumber
  const address = req.body.address;
  const description = req.body.description;

  const charity = new Charity({
    date: today,
    charityName,
    description,
    phoneNumber,
    address,
    userId: req.user._id
  });
  charity
    .save()
    .then(result => {
      console.log(today, `Charity created. Date: ${today}. CharityName: ${charityName}`);
      res.redirect('/display-charities');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getcharities = (req, res, next) => {
  const currentUser = req.user;
  const page = parseInt(req.query.page) || 1;
  let totalItems;
  let itemCounterStartInCurrentPage;
  Charity
    .estimatedDocumentCount()
    .then(number => {
      totalItems = number;
      itemCounterStartInCurrentPage = totalItems - ITEMS_PER_PAGE * (page - 1);
      return Charity
        .find()
        .sort({ date: -1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .populate('userId');
    })
    .then(charities => {
      res.render('charity/charities', {
        itemCounterStartInCurrentPage,
        charities,
        pageTitle: 'Charities',
        currentUser,
        paginationObject: paginator(page, ITEMS_PER_PAGE, totalItems)
      });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditCharity = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const charityId = req.params.charityId;
  Charity.findById(charityId)
    .then(charity => {
      if (!charity) {
        return res.redirect('/');
      }
      res.render('charity/edit-charity', {
        pageTitle: 'Edit Charity',
        editing: editMode,
        charity
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditCharity = (req, res, next) => {
  const today = getCurrentDate();
  const charityId = req.body.charityId;
  const updateCharityName = req.body.charityName;
  const updatePhoneNumber = req.body.phoneNumber
  const updateAddress = req.body.address;
  const updateDescription = req.body.description;
  Charity.findById(charityId)
    .then(charity => {
      if (charity.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      charity.charityName = updateCharityName;
      charity.description = updateDescription;
      charity.phoneNumber = updatePhoneNumber;
      charity.address = updateAddress;
      charity.editDate = today;
      return charity.save()
        .then(result => {
          console.log(today, `Charity edited. Edit Date: ${today}. CharityName: ${updateCharityName}`);
          res.redirect('/display-charity');
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postDeleteCharity = (req, res, next) => {
  const charityId = req.body.charityId;
  Charity.deleteOne({
    _id: charityId,
    userId: req.user._id
  })
    .then(() => {
      console.log(`Charity with id ${charityId} has been deleted.`);
      res.redirect('/display-charities');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/*End Charity Controller */

/* Start Needed Blood */

exports.getAddNeededBlood = (req, res, next) => {
  res.render('needblood/add-needBlood', {
    pageTitle: 'Add Patient'
  });
};

exports.postAddNeededBlood = (req, res, next) => {
  const today = getCurrentDate();
  const patientName = req.body.patientName;
  const quantity = req.body.quantity
  const department = req.body.department;
  const bloodType = req.body.bloodType;

  const patient = new Needed({
    date: today,
    patientName,
    quantity,
    department,
    bloodType,
    userId: req.user._id
  });
  patient
    .save()
    .then(result => {
      console.log(today, `Patient added. Date: ${today}. PatientName: ${patientName}`);
      res.redirect('/display-neededBlood');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getNeededBloods = (req, res, next) => {
  const currentUser = req.user;
  const page = parseInt(req.query.page) || 1;
  let totalItems;
  let itemCounterStartInCurrentPage;
  Needed
    .estimatedDocumentCount()
    .then(number => {
      totalItems = number;
      itemCounterStartInCurrentPage = totalItems - ITEMS_PER_PAGE * (page - 1);
      return Needed
        .find()
        .sort({ date: -1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .populate('userId');
    })
    .then(patients => {
      res.render('needblood/patients', {
        itemCounterStartInCurrentPage,
        patients,
        pageTitle: 'Patients',
        currentUser,
        paginationObject: paginator(page, ITEMS_PER_PAGE, totalItems)
      });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditNeededBlood = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const patientId = req.params.patientId;
  Needed.findById(patientId)
    .then(patient => {
      if (!patient) {
        return res.redirect('/');
      }
      res.render('needblood/edit-needBlood', {
        pageTitle: 'Edit NeededBlood',
        editing: editMode,
        patient
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditNeededBlood = (req, res, next) => {
  const today = getCurrentDate();
  const patientId = req.body.patientId;
  const updatePatientName = req.body.patientName;
  const updateQuantity = req.body.quantity;
  const updateDepartment = req.body.department;
  const updateBloodType = req.body.bloodType;
  Needed.findById(patientId)
    .then(patient => {
      if (patient.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      patient.charityName = updatePatientName;
      patient.quantity = updateQuantity;
      patient.department = updateDepartment;
      patient.bloodType = updateBloodType;
      patient.editDate = today;
      return patient.save()
        .then(result => {
          console.log(today, `Patient edited. Edit Date: ${today}. PatientName: ${updatePatientName}`);
          res.redirect('/display-NeededBlood');
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postDeleteNeededBlood = (req, res, next) => {
  const patientId = req.body.patientId;
  Needed.deleteOne({
    _id: patientId,
    userId: req.user._id
  })
    .then(() => {
      console.log(`Patient with id ${patientId} has been deleted.`);
      res.redirect('/display-NeededBlood');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


/*End Needed Blood */

/*Start Blood */

exports.getAddBlood = (req, res, next) => {
  res.render('blood/add-blood', {
    pageTitle: 'Add Blood'
  });
};

exports.postAddBlood = (req, res, next) => {
  const today = getCurrentDate();
  const bloodType = req.body.bloodType;
  const bloodQuantity = req.body.bloodQuantity;

  const blood = new Hospital({
    date: today,
    bloodQuantity,
    bloodType,
    userId: req.user._id
  });
  blood
    .save()
    .then(result => {
      //console.log(today, `Blood added. Date: ${today}. Blood Type: ${bloodType}`);
      res.redirect('/display-bloods');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getBloods = (req, res, next) => {
  const currentUser = req.user;
  const page = parseInt(req.query.page) || 1;
  let totalItems;
  let itemCounterStartInCurrentPage;
  Hospital
    .estimatedDocumentCount()
    .then(number => {
      totalItems = number;
      itemCounterStartInCurrentPage = totalItems - ITEMS_PER_PAGE * (page - 1);
      return Hospital
        .find()
        .sort({ date: -1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .populate('userId');
    })
    .then(bloods => {
      res.render('blood/bloods', {
        itemCounterStartInCurrentPage,
        bloods,
        pageTitle: 'Bloods',
        currentUser,
        paginationObject: paginator(page, ITEMS_PER_PAGE, totalItems)
      });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditBlood = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const bloodId = req.params.bloodId;
  Hospital.findById(bloodId)
    .then(blood => {
      if (!blood) {
        return res.redirect('/');
      }
      res.render('blood/edit-blood', {
        pageTitle: 'Edit Blood',
        editing: editMode,
        blood
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditBlood = (req, res, next) => {
  const today = getCurrentDate();
  const bloodId = req.body.bloodId;
  const updateBloodQuantity = req.body.bloodQuantity;
  const updateBloodType = req.body.bloodType;
  Hospital.findById(bloodId)
    .then(blood => {
      if (blood.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      blood.bloodQuantity = updateBloodQuantity;
      blood.bloodType = updateBloodType;
      blood.editDate = today;
      return blood.save()
        .then(result => {
          console.log(today, `Blood edited. Edit Date: ${today}. BloodType: ${updateBloodType}`);
          res.redirect('/display-bloods');
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postDeleteBlood = (req, res, next) => {
  const bloodId = req.body.bloodId;
  Hospital.deleteOne({
    _id: bloodId,
    userId: req.user._id
  })
    .then(() => {
      console.log(`Blood with id ${bloodId} has been deleted.`);
      res.redirect('/display-bloods');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


/*End Blood */
/* Start Bags */

exports.getAddBag = (req, res, next) => {
  res.render('bag/add-bag', {
    pageTitle: 'Add Blood Bags'
  });
};

exports.postAddBag = (req, res, next) => {
  const today = getCurrentDate();
  const bloodType = req.body.bloodType;
  const bloodQuantity = req.body.bloodQuantity;
  const charityName = req.body.charityName;
  const donorName = req.body.donorName;

  const bag = new Bag({
    date: today,
    bloodQuantity,
    bloodType,
    charityName,
    donorName,
    userId: req.user._id
  });
  bag
    .save()
    .then(result => {
      console.log(today, `Blood Bag added. Date: ${today}. Blood Type: ${bloodType}`);
      res.redirect('/display-bags');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getBags = (req, res, next) => {
  const currentUser = req.user;
  const page = parseInt(req.query.page) || 1;
  let totalItems;
  let itemCounterStartInCurrentPage;
  Bag
    .estimatedDocumentCount()
    .then(number => {
      totalItems = number;
      itemCounterStartInCurrentPage = totalItems - ITEMS_PER_PAGE * (page - 1);
      return Bag
        .find()
        .sort({ date: -1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .populate('userId');
    })
    .then(bags => {
      res.render('bag/bags', {
        itemCounterStartInCurrentPage,
        bags,
        pageTitle: 'Blood Bags',
        currentUser,
        paginationObject: paginator(page, ITEMS_PER_PAGE, totalItems)
      });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditBag = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const bagId = req.params.bagId;
  Bag.findById(bagId)
    .then(bag => {
      if (!bag) {
        return res.redirect('/');
      }
      res.render('bag/edit-bag', {
        pageTitle: 'Edit Blood',
        editing: editMode,
        bag
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postEditBag = (req, res, next) => {
  const today = getCurrentDate();
  const bagId = req.body.bagId;
  const updateBloodQuantity = req.body.bloodQuantity;
  const updateBloodType = req.body.bloodType;
  const updateCharityName = req.body.charityName;
  const updateDonorName = req.body.donorName;
  Bag.findById(bagId)
    .then(bag => {
      if (bag.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      bag.bloodQuantity = updateBloodQuantity;
      bag.bloodType = updateBloodType;
      bag.charityName = updateCharityName;
      bag.donorName = updateDonorName;
      bag.editDate = today;
      return bag.save()
        .then(result => {
          console.log(today, `Blood edited. Edit Date: ${today}. BloodType: ${updateBloodType}`);
          res.redirect('/display-bags');
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postDeleteBag = (req, res, next) => {
  const bagId = req.body.bagId;
  Bag.deleteOne({
    _id: bagId,
    userId: req.user._id
  })
    .then(() => {
      console.log(`Blood Bag with id ${bagId} has been deleted.`);
      res.redirect('/display-bags');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/*End Bags */

/*Password */

/* Info */
exports.getIndex = (req, res, next) => {
  if (req.session.user.role !== 'superuser') {
    return res.redirect('/donor/home/index');
  }
  res.render('donor/view', {
    pageTitle: 'Main Page'
  });
};

/*Edit Info */

exports.getUser = async (req, res, next) => {
  const currentUser = req.user;
  try {
    const users = await User.find();
    res.render('account/index', {
      users: users,
      currentUser,
      pageTitle: 'Account'
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
}

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    res.render('account/show', {
      user: user,
      pageTitle: 'Account'
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
}

exports.getEditInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.render('account/edit',
      {
        user: user,
        pageTitle: 'Edit User'
      });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
}

exports.getChangePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.render('account/edit-password', {
      user: user,
      pageTitle: 'Change password'
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
}

exports.changePassword = async (req, res, next) => {
  let user;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('account/edit-password', {
        pageTitle: 'Change password',
        errorMessage: errors.array()[0].msg,
      });
    }
    let password = await bcrypt.hash(req.body.password, 12);
    user = await User.findById(req.params.id);
    user.password = password;
    await user.save();
    res.redirect(`/user/${user.id}`);
  } catch (err) {
    if (user == null) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    } else {
      res.render('account/edit', {
        user: user,
        errorMessage: errors.array()[0].msg,
        pageTitle: 'Edit'
      });
    }

  }
}
exports.UpdateUser = async (req, res) => {
  let user;
  try {
    user = await User.findById(req.params.id);
    user.city = req.body.city;
    user.state = req.body.state;
    user.phoneNumber = req.body.phoneNumber;
    user.bloodType = req.body.bloodType;
    await user.save();
    res.redirect(`/user/${user.id}`);
  } catch (err) {
    if (user == null) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    } else {
      res.render('account/edit', {
        user: user,
        errorMessage: 'Error updating User',
        pageTitle: 'Edit'
      })
    }
  }
}


/* Start  Add City */
exports.getAddCity = (req, res, next) => {
  res.render('city/add-city', {
    pageTitle: 'Add City'
  });
};

exports.postAddCity = (req, res, next) => {
  const today = getCurrentDate();
  const cityName = req.body.cityName;
  const address = req.body.address;
  const phoneNumber = req.body.phoneNumber;
  const hospital = req.body.hospital;

  const city = new City({
    name: cityName,
    hospital: hospital,
    phoneNumber: phoneNumber,
    address: address,
    userId: req.user._id
  });
  city
    .save()
    .then(result => {
      console.log(today, `City added. Date: ${today}. CityName: ${cityName}`);
      res.redirect('/display-cities');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCities = (req, res, next) => {
  const currentUser = req.user;
  const page = parseInt(req.query.page) || 1;
  let totalItems;
  let itemCounterStartInCurrentPage;
  City
    .estimatedDocumentCount()
    .then(number => {
      totalItems = number;
      itemCounterStartInCurrentPage = totalItems - ITEMS_PER_PAGE * (page - 1);
      return City
        .find()
        .sort({ date: -1 })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .populate('userId');
    })
    .then(cities => {
      res.render('city/cities', {
        itemCounterStartInCurrentPage,
        cities,
        pageTitle: 'City',
        currentUser,
        paginationObject: paginator(page, ITEMS_PER_PAGE, totalItems)
      });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditCity = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const cityId = req.params.cityId;
  City.findById(cityId)
    .then(city => {
      if (!city) {
        return res.redirect('/');
      }
      res.render('city/edit-city', {
        pageTitle: 'Edit City',
        editing: editMode,
        city
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postEditCity = (req, res, next) => {
  const today = getCurrentDate();
  const cityId = req.body.cityId;
  const updateCityName = req.body.cityName;
  const updateHospital = req.body.hospital;
  const updateAddress = req.body.address;
  const updatePhoneNumber = req.body.phoneNumber;
  City.findById(cityId)
    .then(city => {
      if (city.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      city.name = updateCityName;
      city.hospital = updateHospital;
      city.address = updateAddress;
      city.phoneNumber = updatePhoneNumber;
      return city.save()
        .then(result => {
          console.log(today, `City edited. Edit Date: ${today}. CityName: ${updateCityName}`);
          res.redirect('/display-cities');
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postDeleteCity = (req, res, next) => {
  const cityId = req.body.cityId;
  City.deleteOne({
    _id: cityId,
    userId: req.user._id
  })
    .then(() => {
      console.log(`City with id ${cityId} has been deleted.`);
      res.redirect('/display-cities');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

/* End */



exports.getUsers = async(req, res, next) => {
  const currentUser = req.user;
  const page = parseInt(req.query.page) || 1;
  let totalItems;
  let itemCounterStartInCurrentPage;
  let searchOptions = {};
  if (req.query.bloodType != null && req.query.bloodType !== '') {
    searchOptions.bloodType = new RegExp(req.query.bloodType, 'i');
  }
  try{
    let number = await User.estimatedDocumentCount();
    totalItems = number;
    itemCounterStartInCurrentPage = totalItems - ITEMS_PER_PAGE * (page - 1);
    let users = await User.find().sort({ date: -1 }).skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate('userId');
    let types = await User.find(searchOptions);
    res.render('donor/users', {
      itemCounterStartInCurrentPage,
      users,
      types: types,
      pageTitle: 'Users',
      searchOptions: req.query,
      currentUser,
      paginationObject: paginator(page, ITEMS_PER_PAGE, totalItems)
    });
  }catch(err){
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  }
  // User
  //   .estimatedDocumentCount()
  //   .then(number => {
  //     totalItems = number;
  //     itemCounterStartInCurrentPage = totalItems - ITEMS_PER_PAGE * (page - 1);
  //     return User
  //       .find()
  //       .sort({ date: -1 })
  //       .skip((page - 1) * ITEMS_PER_PAGE)
  //       .limit(ITEMS_PER_PAGE)
  //       .populate('userId');
  //   })
  //   .then(users => {
  //     res.render('donor/users', {
  //       itemCounterStartInCurrentPage,
  //       users,
  //       pageTitle: 'Users',
  //       currentUser,
  //       paginationObject: paginator(page, ITEMS_PER_PAGE, totalItems)
  //     });
  //   }).catch(err => {
  //     const error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   });
};




exports.postSms = async(req,res,next) => {
  try{
    const number = req.body.phoneNumber;
    const from = 'Vonage APIs';
    const to = number;
    const text = 'Mohammed Aboabdo xD';
    res.redirect('/sendSms');
    nexmo.message.sendSms(from,to,text);

  }catch(err){
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
}


//Send EMail to users

exports.getEmails = async (req, res, next) => {
  const currentUser = req.user;
  const page = parseInt(req.query.page) || 1;
  let totalItems;
  let itemCounterStartInCurrentPage;
  let searchOptions = {};
  if (req.query.bloodType != null && req.query.bloodType !== '') {
    searchOptions.bloodType = new RegExp(req.query.bloodType, 'i');
  }
  try {
    let number = await User.estimatedDocumentCount();
    totalItems = number;
    itemCounterStartInCurrentPage = totalItems - ITEMS_PER_PAGE * (page - 1);
    let users = await User.find().sort({ date: -1 }).skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).populate('userId');
    let types = await User.find(searchOptions);
    res.render('donor/emails', {
      itemCounterStartInCurrentPage,
      users,
      types: types,
      pageTitle: 'Users',
      searchOptions: req.query,
      currentUser,
      paginationObject: paginator(page, ITEMS_PER_PAGE, totalItems)
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
  // User
  //   .estimatedDocumentCount()
  //   .then(number => {
  //     totalItems = number;
  //     itemCounterStartInCurrentPage = totalItems - ITEMS_PER_PAGE * (page - 1);
  //     return User
  //       .find()
  //       .sort({ date: -1 })
  //       .skip((page - 1) * ITEMS_PER_PAGE)
  //       .limit(ITEMS_PER_PAGE)
  //       .populate('userId');
  //   })
  //   .then(users => {
  //     res.render('donor/emails', {
  //       itemCounterStartInCurrentPage,
  //       users,
  //       pageTitle: 'Users',
  //       currentUser,
  //       paginationObject: paginator(page, ITEMS_PER_PAGE, totalItems)
  //     });
  //   }).catch(err => {
  //     const error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   });
};


exports.postEmail = async (req, res, next) => {

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash('error', 'No account with that email found.');
      return res.redirect('/sendEmail');
    }
    res.redirect('/sendEmail');
    transporter.sendMail({
      to: req.body.email,
      from: 'bloodbankManagementsystem@protonmail.com',
      subject: 'Request a blood bag',
      html: `
          <p>Please, go to the hospital * as soon as you need a blood bag of your kind</p>
          
        `
    });

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}
