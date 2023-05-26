const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bagSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    editDate: {
        type: Date,
    },
    bloodType:{
        type:String,
        required:true
    },
    bloodQuantity:{
        type:Number,
        required:true
    },
    charityName:String,
    donorName:{
        type:String,
        required:true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Bag', bagSchema);

