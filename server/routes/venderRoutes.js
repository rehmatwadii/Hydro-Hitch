const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { createProduct, getProducts, getUserProducts, updateProduct, deleteProduct, toggleProductStatus, getVendorProducts } = require('../controllers/productController');

// const userAuth = require('../Middleware/userAuth');
// const cookieParser = require("cookie-parser");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Folder to save images
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/; // Allowed file types
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Images only!'));
        }
    },
});

const { RegisterVender, LoginVender, getVendorList, toggleVendorStatus, getVendor, updateQualityReport, getDashboard } = require('../controllers/venderControllers');
const { getOrdersByVendor, updateOrderStatus } = require('../controllers/orderController');

router.route('/register').post(RegisterVender);
router.route('/login').post(LoginVender);
// router.route('/about').get(userAuth,currentUser);
// router.route('/logout').get(userAuth,logoutUser);
// routes/productRoutes.js


router.route('/products').post(upload.single('image'), createProduct);
router.route('/products').get(getProducts);
router.route('/dashboard/:id').get(getDashboard);
router.route('/products/:id').get(getUserProducts);
router.route('/products/vendor/:id').get(getVendorProducts);
router.route('/products/:id').put(upload.single('image'), updateProduct);
router.route('/products/:id').delete(deleteProduct);
router.route('/products/:id/status').put(toggleProductStatus);
router.route('/order/:orderId/status').put(updateOrderStatus);
router.route('/:venderId/orders').get(getOrdersByVendor);
router.route('/vendors').get(getVendorList);
router.route('/vendor/:id').get(getVendor);
router.route('/vendors/:id/status').post(toggleVendorStatus);
router.route("/vendors/:id/quality-report").put(updateQualityReport);

module.exports = router;


module.exports = router;