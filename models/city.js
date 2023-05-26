const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const citySchema = new Schema({
   
    name:{
        type:String,
        required:true
    },
    hospital:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true

    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('City', citySchema);

