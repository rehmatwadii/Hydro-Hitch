// const { json } = require("express");
const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Vender = require("../models/venderModel");
const CustomerOrder = require("../models/CustomerOrders");
const sendEmail = require("../Utils/mailSender");

// Custom Functions

const RegisterUser = async (req, res) => {
  const { name, email, phone, password, longitude, latitude } = req.body;
  console.log(req.body);
  if (
    name.length == 0 ||
    phone.length == 0 ||
    email.length == 0 ||
    password.length == 0 ||
    !longitude || !latitude
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
      longitude, latitude
    });
    await user.save();
    res.status(201).json({ message: "User regsitered " });
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};
const LogoutUser = (req, res) => {
  res.clearCookie("jwtoken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  return res.status(200).json({ message: "User Logged Out" });
};
// const LoginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (email.length == 0 || password.length == 0) {
//       return res.status(204).json({ message: "fields cannot be left emoty" });
//     }
//     const userLogin = await User.findOne({ email: email });
//     if (userLogin) {
//       const passMatch = await bcrypt.compare(password, userLogin.password);
//       // passMatch = true or false ;
//       console.log(`passwordMatch = ${passMatch}`);
//       if (passMatch) {
//         console.log(`Password Match is  : ${passMatch}`);
//         const token = await userLogin.generateAuthToken();
//         res.cookie("jwtoken", token, {
//           httpOnly: true,
//           secure: true, // Set to true if your app is served over HTTPS
//           sameSite: "None",
//         });
//         const verifyToken = jwt.verify(token, process.env.SECRETKEY);
//         console.log(verifyToken);
//         res.status(201).json({ message: "User Logged In" });
//       } else {
//         return res.status(422).json({ message: "Password Incorrect" });
//       }
//     } else {
//       return res.status(420).json({ message: "Invalid Email" });
//     }
//   } catch (error) {
//     res.send(`error : ${error}`);
//   }
// };
const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email.length == 0 || password.length == 0) {
      return res.status(400).json({ message: "Fields cannot be left empty" });
    }
    const userLogin = await User.findOne({ email: email });
    if (userLogin) {
      const passMatch = await bcrypt.compare(password, userLogin.password);
      if (passMatch) {
        const token = await userLogin.generateAuthToken();
        res.cookie("jwtoken", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
        });
        return res.status(201).json({ message: "User Logged In", isAuthenticated: true, data: userLogin });
      } else {
        return res.status(401).json({ message: "Password Incorrect" });
      }
    } else {
      return res.status(404).json({ message: "Invalid Email" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getAllVender = async (req, res) => {
  try {
    console.log("done ");
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

const venderOnPrice = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.body;
    console.log(minPrice, maxPrice)

    // if (!minPrice || !maxPrice) {
    //   return res.status(400).json({ error: 'Both minPrice and maxPrice are required.' });
    // }
    const allVenders = await Vender.find();

    // Filter the data
    const filteredShops = allVenders.filter(shop => shop.price1 >= minPrice && shop.price3 <= maxPrice);
    res.json(filteredShops).status(201);

  } catch (err) {
    console.log(err)
  };
}

const getVenderById = async (req, res) => {
  const VenderId = req.params.id;
  const User = req.rootUser
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
  console.log("Placing a new order");
  const { CustomerAddress, Price, CustomerPhone, CustomerName, CustomerEmail, productId, userId } = req.body;
  const venderId = req.params.id;

  // Check for missing fields
  if (
    !CustomerAddress ||
    !Price ||
    !CustomerPhone ||
    !CustomerName ||
    !CustomerEmail ||
    !productId
  ) {
    console.log("All fields are required");
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find the vender by ID
    const vender = await Vender.findById(venderId);
    if (!vender) {
      console.log("Vendor not found");
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Create a new order
    const customerOrder = new CustomerOrder({
      userid: userId,
      CustomerEmail,
      CustomerPhone,
      Price,
      VenderEmail: vender.email,
      venderId,
      productId,
      CustomerAddress,
      CustomerName,
      status: 'pending',  // Set default status to "pending"
    });

    // Save the order and notify the vendor
    await customerOrder.save();
    notifyvender(customerOrder);

    console.log("Order placed successfully");
    res.status(201).json({ message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Error placing order", error });
  }
};

//  Send Mail to the User 
const notifyvender = async (order) => {
  try {
    console.log(order.VenderEmail)
    await sendEmail({
      VenderEmail: order.VenderEmail,
      subject: 'New Order',
      htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f9f9f9;
                  margin: 0;
                  padding: 0;
                  color: #333;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  overflow: hidden;
              }
              .header {
                  background-color: #4CAF50;
                  color: white;
                  text-align: center;
                  padding: 20px 0;
              }
              .header h1 {
                  margin: 0;
                  font-size: 24px;
              }
              .content {
                  padding: 20px;
              }
              .content p {
                  margin: 0 0 10px;
              }
              .content ul {
                  list-style-type: none;
                  padding: 0;
              }
              .content ul li {
                  background: #f3f3f3;
                  padding: 10px;
                  margin-bottom: 8px;
                  border-radius: 4px;
              }
              .footer {
                  text-align: center;
                  padding: 10px;
                  background: #f1f1f1;
                  color: #666;
                  font-size: 12px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>New Order Confirmation</h1>
              </div>
              <div class="content">
                  <p>Hurray! A new order has been placed.</p>
                  <ul>
                      <li><strong>Order ID:</strong> ${order._id}</li>
                      <li><strong>Customer Name:</strong> ${order.CustomerName}</li>
                      <li><strong>Customer Email:</strong> ${order.CustomerEmail}</li>
                      <li><strong>Customer Phone:</strong> ${order.CustomerPhone}</li>
                      <li><strong>Price:</strong> ${order.Price} PKR</li>
                      <li><strong>Customer Address:</strong> ${order.CustomerAddress}</li>
                  </ul>
                  <p>Thank you for your prompt action on this order!</p>
              </div>
              <div class="footer">
                  <p>Hydrohitch | Order Management System</p>
                  <p>&copy; ${new Date().getFullYear()} Pure Flow. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
      `,

    });
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
  venderOnPrice,
  LogoutUser,
  notifyvender
};
