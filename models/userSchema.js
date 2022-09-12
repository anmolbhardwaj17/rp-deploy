const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({   //schema DTO/DBO
    username:{
        type:String,
    },
    email:{
        type:String,
        //required:true
    },
    password:{
        type:String,
        //required:true
    },
    token:{
        type:String,
    }
})

const User = mongoose.model('USER', userSchema);
module.exports = User;