const express = require('express');
const router = express.Router();

// const userAuth = require('../Middleware/userAuth');
// const cookieParser = require("cookie-parser");



const { RegisterVender, LoginVender } = require('../controllers/venderControllers');

router.route('/register').post(RegisterVender);
router.route('/login').post(LoginVender);
// router.route('/about').get(userAuth,currentUser);
// router.route('/logout').get(userAuth,logoutUser);

module.exports = router ;