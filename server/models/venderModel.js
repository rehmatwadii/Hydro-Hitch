const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// const reviewSchema = new mongoose.Schema(
 
// );

const venderSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  price1: {
    type: Number,
    // required: true,
  },
  price2: {
    type: Number,
    // required: true,
  },
  price3: {
    type: Number,
    // required: true,
  },
  shopAddress: {
    type: String,
  },
  reviews: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
      },
      comment: {
        type: String,
      },
      timestamps: {
        type: Date,
        default: Date.now,
      },
    },
    
  ],
  TotalReviews: {
    type: Number,
    default: 0,
  },
  OverAllRating: {
    type: Number,
    default: 0,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// Genrating Token
venderSchema.methods.generateAuthToken = async function () {
  try {
    console.log(`Token == generating `);
    let genToken = jwt.sign({ _id: this._id }, "mernapplication5678912345");
    console.log(`Token == ${genToken}`);
    this.tokens = this.tokens.concat({ token: genToken });
    await this.save();
    return genToken;
  } catch (error) {
    console.log(`error is ${error}`);
  }
};

const Vender = mongoose.model("Vender", venderSchema);
module.exports = Vender;
