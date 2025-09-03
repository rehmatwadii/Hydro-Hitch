const mongoose = require('mongoose');

const Orderschema = new mongoose.Schema({

    VenderEmail: {
        type: String
    },
    CustomerEmail: {
        type: String
    },
    CustomerPhone: {
        type: Number
    },
    CustomerAddress: {
        type: String
    },
    CustomerName: {
        type: String
    },
    Price: {
        type: Number
    },
    status: {
        type: String,
        enum: ['pending', 'process', 'completed'],
        default: 'pending'
    },
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    venderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vender', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
})

const CustomerOrder = mongoose.model('CustomerOrder', Orderschema)
module.exports = CustomerOrder;