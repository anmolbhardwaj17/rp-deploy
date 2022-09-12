const dotenv = require('dotenv');
dotenv.config({path: '../config.env'});
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userSchema");

module.exports = {
    login: async function(email, password){
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {

            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                expiresIn: "2h",
                }
            );
            user.token = token;

            return({status:200, user:user});
        }else{
            return({status:400, message:"login failed"})
        }
    },

    register: async function(username, email, password){
        const oldUser = await User.findOne({ email });

        if (oldUser) {
          return {status:409, message:"User Already Exist. Please Login"}
        }
    
        encryptedPassword = await bcrypt.hash(password, 10);
    
        const user = await User.create({
          username:username,
          email: email.toLowerCase(),
          password: encryptedPassword,
        });
    
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
        user.token = token;
    
        return {status:200, user:user}
    }
};