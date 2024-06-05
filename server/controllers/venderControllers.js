const vender = require("../models/venderModel")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Custom Functions

const RegisterVender = async (req, res) => {
  const { shopName, email, phone, password, shopAddress ,reviews,description,price1,price2,price3} = req.body;
  console.log(req.body);
  if (
    shopName.length == 0 ||
    description.length == 0 ||
    phone.length == 0 ||
    email.length == 0 ||
    password.length == 0 ||
    shopAddress.length == 0 ||
    price1.length == 0||
    price2.length == 0||
    price3.length == 0
  ) {
    console.log("fields cannot be left emoty");
    return res.status(204).json({ message: "fields cannot be left emoty" });
  }
  try {
    const VenderExist = await vender.findOne({ email : email})
    if (VenderExist) {
      console.log("Vender already registered");
      return res
        .status(422)
        .json({ message: "Vender already exist with this email" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const Vender = new vender({
      shopName,
      description,
      email,
      phone,
      password: hashedPassword,
      reviews,
      shopAddress,
      price1,
      price2,
      price3
    });
    await Vender.save();
    res.status(201).json({ message: "Vender regsitered " });
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

const LoginVender = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("agaya hn")
    if (email.length == 0 || password.length == 0) {
      return res.status(204).json({ message: "fields cannot be left emoty" });
    }
    const userLogin = await vender.findOne({ email: email });
    if (userLogin) {
      const passMatch = await bcrypt.compare(password, userLogin.password);
      // passMatch = true or false ;
      console.log(`passwordMatch = ${passMatch}`);
      if (passMatch) {
        console.log(`Password Match is  : ${passMatch}`);
        const token = await userLogin.generateAuthToken();
        res.cookie("jwtoken", token, {
          httpOnly: true,
        });
        res.status(201).json({ message: "Vender Logged In" });
      } else {
        return res.status(422).json({ message: "Password Incorrect" });
      }
    } else {
      return res.status(404).json({ message: "Invalid Email" });
    }
  } catch (error) {
    res.status(500).json(`error : ${error}`);
  }
};

module.exports = { LoginVender, RegisterVender };
