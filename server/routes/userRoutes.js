const express = require('express');
const router = express.Router();
const { RegisterUser, LoginUser, getAllVender ,getVenderById , createReview, placeOrder , venderOnPrice } = require('../controllers/userControllers');
const userAuthenticate = require('../middlewares/userAuth');

router.route('/register').post(RegisterUser);
router.route('/login').post(LoginUser);
router.route('/allVenders').get(getAllVender);
router.route('/vender/:id').get(userAuthenticate,getVenderById);
router.route('/newReview/:id').post(userAuthenticate,createReview)
router.route('/order/:id').post(userAuthenticate, placeOrder);
router.route('/filter').post(venderOnPrice)
// router.route('/logout').get(userAuth, logoutUser);

module.exports = router;
