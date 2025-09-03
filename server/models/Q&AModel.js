const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vender' },
    answer: { type: String },
    createdAt: { type: Date, default: Date.now },
    answeredAt: { type: Date },
    status: { type: String, enum: ['pending', 'answered'], default: 'pending' },
});

module.exports = mongoose.model('Question', QuestionSchema);
