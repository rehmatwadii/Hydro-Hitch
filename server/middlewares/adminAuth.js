
const jwt = require("jsonwebtoken");
const Admin = require('../Models/adminModel');
require('dotenv').config();
const bcrypt = require('bcrypt')


const adminAuthenticate = async (req , res , next) =>{
    try{
        const token = req.cookies.jwtoken;
        const verifyToken = jwt.verify(token,process.env.SECRETKEY);
        const rootUser = await Admin.findOne({_id:verifyToken._id , "tokens.token":token});
        if (!rootUser){
            throw new Error('Admin not found')
        }
        req.token = token;
        req.rootUser = rootUser;
        req.userID = rootUser._id;

        next();
                                                               
    }catch(error){
        return res.status(505).json({message:'Admin Not Logged In'});
    }

}

module.exports = adminAuthenticate;