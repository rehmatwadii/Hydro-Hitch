const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    dcPerKm: { type: Number, required: true },
    gallon: { type: Number, required: true },
    description: { type: String },
    image: { type: String, required: true },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vender', required: true }, // Reference to User
});

module.exports = mongoose.model('Product', ProductSchema);
