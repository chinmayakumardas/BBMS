const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({    
    email: {
        type: String,
        required: true
      },
      password: {
        type: String,
        required: true
      },
      firstName:{
        type:String,
        required:true,
      },
      role:{
        type:String,
        require:true,
        default:'user'
      },
      lastName:{
        type:String,
        required:true,
      },
      code:{
        type:String,
        required:true,
      },
      state:{
        type:String,
        required:true,
      },
      city:{
        type:String,
        required:true,
      },
      phoneNumber:{
        type:Number,
        required:true,
      },
      bloodType:{
        type:String,
      },
    resetToken: String,
    resetTokenExpiration: Date
});

module.exports = mongoose.model('User', userSchema);

