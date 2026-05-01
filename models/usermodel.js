const mongoose = require('mongoose');
const userModel =new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    name:{
        type:String
    }

})
module.exports = mongoose.model('user',userModel);