const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const neededBloodSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    editDate: {
        type: Date,
    },
    patientName: {
        type: String,
        required: true,
    },
    department:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    bloodType: {
        type: String,
        required:true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Needed', neededBloodSchema);

