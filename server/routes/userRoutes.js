const express = require('express');
const router = express.Router();
const { RegisterUser, LogoutUser, LoginUser, getAllVender, getVenderById, createReview, placeOrder, venderOnPrice } = require('../controllers/userControllers');
const userAuthenticate = require('../middlewares/userAuth');
const { createReport, getReports } = require('../controllers/userReportVendorController');
const { postQuestion, getUserQuestions, answerQuestion } = require('../controllers/q&aControllers');
const { getOrdersByUser } = require('../controllers/orderController');

router.route('/register').post(RegisterUser);
router.route('/login').post(LoginUser);
router.post("/logout", LogoutUser);
router.route('/allVenders').get(getAllVender);
router.route('/vender/:id').get(userAuthenticate, getVenderById);
router.route('/newReview/:id').post(userAuthenticate, createReview)
router.route('/order/:id').post(userAuthenticate, placeOrder);
router.route('/order/:userid').get(userAuthenticate, getOrdersByUser);
router.route('/filter').post(venderOnPrice)
router.route('/add-report').post(createReport)
router.route('/get-report').get(getReports)
router.route('/questions').post(postQuestion)
router.route('/questions/:id').get(getUserQuestions)
router.route('/questions/answer/:questionId').post(answerQuestion)
// router.route('/logout').get(userAuth, logoutUser);

module.exports = router;
