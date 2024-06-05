const jwt = require("jsonwebtoken");
const User = require('../models/userModel');
require('dotenv').config();



const userAuthenticate = async (req , res , next) =>{
    try{
        console.log("from Auth")
        const token = req.cookies.jwtoken;
        console.log("token >>",token)
        if (!token) {
            return res.status(420).josn({message:'Token not provided'});
          }
        const verifyToken = jwt.verify(token,process.env.SECRETKEY);
        const rootUser = await User.findOne({_id:verifyToken._id , "tokens.token":token});
        if (!rootUser){
            console.log('User not found')
        }
        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next();
                                                               
    }catch(error){
        return res.status(505).json({message:'User Not Logged In'}), console.log("user not log in",error)
    }

}

module.exports = userAuthenticate;