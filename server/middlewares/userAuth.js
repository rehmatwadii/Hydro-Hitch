const jwt = require("jsonwebtoken");
const User = require('../models/userModel');
require('dotenv').config();

const userAuthenticate = async (req, res, next) => {
    try {
        const token = req.cookies.jwtoken;
        if (!token) {
            req.isAuthenticated = false;
            return next(); // Proceed without authentication
        }
        const verifyToken = jwt.verify(token, process.env.SECRETKEY);
        const rootUser = await User.findOne({ _id: verifyToken._id, "tokens.token": token });
        if (!rootUser) {
            req.isAuthenticated = false;
            return next(); // Proceed without authentication
        }
        req.isAuthenticated = true;
        req.rootUser = rootUser;
        req.userID = rootUser._id;
        next();
    } catch (error) {
        req.isAuthenticated = false;
        next();
    }
}

module.exports = userAuthenticate;
