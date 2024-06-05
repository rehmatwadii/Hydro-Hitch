// const { json } = require("express");
const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Vender = require("../models/venderModel");
const Order = require("../models/order");
const sendEmail = require("../Utils/mailSender");

// Custom Functions

const RegisterUser = async (req, res) => {
  const { name, email, phone, password } = req.body;
  console.log(req.body);
  if (
    name.length == 0 ||
    phone.length == 0 ||
    email.length == 0 ||
    password.length == 0
  ) {
    console.log("fields cannot be left emoty");
    return res.status(204).json({ message: "fields cannot be left emoty" });
  }
  try {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      console.log("user already registered");
      return res
        .status(422)
        .json({ message: "User already exist with this email" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ message: "User regsitered " });
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email.length == 0 || password.length == 0) {
      return res.status(204).json({ message: "fields cannot be left emoty" });
    }
    const userLogin = await User.findOne({ email: email });
    if (userLogin) {
      const passMatch = await bcrypt.compare(password, userLogin.password);
      // passMatch = true or false ;
      console.log(`passwordMatch = ${passMatch}`);
      if (passMatch) {
        console.log(`Password Match is  : ${passMatch}`);
        const token = await userLogin.generateAuthToken();
        res.cookie("jwtoken", token, {
          httpOnly: true,
          secure: true, // Set to true if your app is served over HTTPS
          sameSite: "None",
        });
        const verifyToken = jwt.verify(token, process.env.SECRETKEY);
        console.log(verifyToken);
        res.status(201).json({ message: "User Logged In" });
      } else {
        return res.status(422).json({ message: "Password Incorrect" });
      }
    } else {
      return res.status(420).json({ message: "Invalid Email" });
    }
  } catch (error) {
    res.send(`error : ${error}`);
  }
};

const getAllVender = async (req, res) => {
  try {
    console.log("agaya hn ");
    const allVenders = await Vender.find();
    console.log(allVenders);
    if (!allVenders) {
      return res.status(401).json({ message: "Vender are not Available" });
    }
    res.status(200).json(allVenders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const venderOnPrice = async (req,res) => {
  try{
      const { minPrice, maxPrice } = req.body;
        console.log(minPrice,maxPrice)

      // if (!minPrice || !maxPrice) {
      //   return res.status(400).json({ error: 'Both minPrice and maxPrice are required.' });
      // }
      const allVenders = await Vender.find();

    // Filter the data
    const filteredShops = allVenders.filter(shop => shop.price1 >= minPrice && shop.price3 <= maxPrice);
    res.json(filteredShops).status(201);

    }catch(err){
      console.log(err)
    };
  }

const getVenderById = async (req, res) => {
  const VenderId = req.params.id;
  const User=req.rootUser
  console.log("VenderId =======", VenderId);
  try {
    const SingleVender = await Vender.findById(VenderId);
    if (!SingleVender) {
      return res.status(401).json({ message: "Vender not found" });
    }
    return res.status(200).json(SingleVender);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createReview = async (req, res) => {
  try {
    const VenderId = req.params.id;
    const { rating, comment } = req.body;
    console.log("VenderId =======", VenderId);

    // Check if the user has already submitted a review for this vender
    const vender = await Vender.findById(VenderId);
    if (!vender) {
      return res.status(404).json({ message: "vender not found" });
    }

    const isReviewed = vender.reviews.find(
      (e) => e.userId.toString() === req.rootUser._id.toString()
    );

    if (isReviewed) {
      return res.status(401).json({ message: "You have already submitted your review" });
    }

    // If the user hasn't submitted a review, proceed with creating the review
    const review = {
      userId: req.rootUser._id,
      name: req.rootUser.name,
      comment: comment,
      rating: rating,
    };

    console.log(review);

    vender.reviews.push(review);
    vender.TotalReviews = vender.reviews.length;

    let avg = 0;
    vender.reviews.forEach((rev) => {
      avg += rev.rating;
    });

    vender.OverAllRating = avg / vender.reviews.length;

    await vender.save();

    return res.status(200).json(vender);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const placeOrder = async (req, res) => {
  const { CustomerAddress,Price , CustomerPhone,CustomerName,CustomerEmail} = req.body;
  const   venderId = req.params.id;
  console.log(req.body );
  console.log(venderId)
  if (
    CustomerAddress.length == 0 ||
    Price.length == 0 ||
    CustomerPhone.length == 0 ||
    CustomerName.length == 0 ||
    CustomerEmail.length == 0 
  ) {
    console.log("fields cannot be left emoty");
    return res.status(204).json({ message: "fields cannot be left emoty" });
  }
  try {
    const vender=await Vender.findById(venderId)
    if (!vender) {
      console.log("vender not found");
      return res.status(404).json({ message: "vender not found" });
    }
    const order = new Order({
      userid:req.rootUser._id,
      CustomerEmail:CustomerEmail,
      CustomerPhone:CustomerPhone,
      Price:Price,
      VenderEmail:vender.email,
      venderId:venderId,
      CustomerAddress:CustomerAddress,
      CustomerName:CustomerName
    });
    await order.save();
    notifyvender(order)
    res.status(201).json({ message: "Order Placed " });
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

//  Send Mail to the User 
const notifyvender = async (order) => {
  try {
    console.log(order.VenderEmail)
   await sendEmail({
      VenderEmail: order.VenderEmail, 
      subject: 'New Order Notification',
      message:"You have an New order",
      // html: `
      //   <p>Hello vender,</p>
      //   <p>A new order has been placed:</p>
      //   <ul>
      //     <li>Order ID: ${order._id}</li>
      //     <li>Customer Name: ${order.CustomerName}</li>
      //     <li>Customer Email: ${order.CustomerEmail}</li>
      //     <li>Customer Phone: ${order.CustomerPhone}</li>
      //     <li>Price: ${order.Price}</li>
      //     <li>Customer Address: ${order.CustomerAddress}</li>
      //   </ul>
      //   <p>Thank you!</p>
      // `,
    });
   res.status(201).json({message:"Email has been sent succsesfully"})
    console.log('vender notified via email:', result);
  } catch (error) {
    console.error('Error notifying vender via email:', error);
  }
}

module.exports = {
  RegisterUser,
  LoginUser,
  getAllVender,
  getVenderById,
  createReview,
  placeOrder,
  venderOnPrice
};
