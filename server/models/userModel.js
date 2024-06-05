const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
})
// Genrating Token
userSchema.methods.generateAuthToken = async function () {
    try {
        console.log(`Token == generating `)
        let genToken = jwt.sign({ _id: this._id },process.env.SECRETKEY);
        console.log(`Token == ${genToken}`)
        this.tokens = this.tokens.concat({token:genToken}); 
        await this.save();
        return genToken;
        
    } catch (error) {
        console.log(`error is ${error}`);
    }
}

// userSchema.methods.comparePassword = async function (enteredPassword,next) {
    // console.log(`Entered Password ${enteredPassword} this passowrd is ${this.password}` )
    // return await bcrypt.compare(`${enteredPassword}`, `${this.password}`);

// }




const User = mongoose.model('User', userSchema);
module.exports = User;