const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const charitySchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    editDate: {
        type: Date,
    },
    charityName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        require: true
    },
    description:{
        type:String
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Charity', charitySchema);

