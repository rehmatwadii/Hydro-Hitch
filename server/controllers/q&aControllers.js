const Question = require('../models/Q&AModel');

const postQuestion = async (req, res) => {
    try {
        const { question, userId, vendorId } = req.body;

        const newQuestion = new Question({
            question,
            userId,
            vendorId,
        });

        await newQuestion.save();
        res.status(201).json({ message: 'Question posted successfully', question: newQuestion });
    } catch (error) {
        res.status(500).json({ message: 'Failed to post question', error });
    }
};


const getPendingQuestions = async (req, res) => {
    try {
        const questions = await Question.find({ status: 'pending' })
            .populate('userId', 'name email') // Populate user details
            .sort({ createdAt: -1 });

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch questions', error });
    }
};


const answerQuestion = async (req, res) => {
    try {
        const { answer, vendorId } = req.body;
        const questionId = req.params.questionId
        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        if (question.status === 'answered') {
            return res.status(400).json({ message: 'Question is already answered' });
        }

        question.answer = answer;
        question.vendorId = vendorId;
        question.status = 'answered';
        question.answeredAt = new Date();

        await question.save();
        res.status(200).json({ message: 'Answer submitted successfully', question });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit answer', error });
    }
};


const getUserQuestions = async (req, res) => {
    try {
        const vendorId = req.params.id; // Assuming user ID is in `req.user`

        const questions = await Question.find({ vendorId })
            .populate(['vendorId', 'userId']) // Populate vendor details
            .sort({ createdAt: -1 });

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user questions', error });
    }
};



module.exports = { getPendingQuestions, getUserQuestions, postQuestion, answerQuestion }