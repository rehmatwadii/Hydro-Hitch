import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuestionAnswer = ({ vendor }) => {
    const [question, setQuestion] = useState(''); // User's question
    const [questions, setQuestions] = useState([]); // List of questions and answers
    const [loading, setLoading] = useState(false); // Loading state
    const [error, setError] = useState(null); // Error state
    const data = localStorage.getItem('loginData') && JSON.parse(localStorage.getItem('loginData'))?.data

    // Fetch questions and answers when the component mounts
    useEffect(() => {
        fetchQuestions();
    }, []);

    // Fetch all questions and answers for the vendor
    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8000/api/user/questions/${vendor._id}`);
            setQuestions(response.data);
        } catch (err) {
            setError('Failed to fetch questions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Submit a new question
    const handleSubmit = async () => {
        if (!question.trim()) return alert('Please enter a question.');
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8000/api/user/questions', {
                question,
                vendorId: vendor._id,
                userId: data._id
            });
            setQuestion(''); // Clear the input field
            fetchQuestions(); // Refresh the question list
        } catch (err) {
            alert('Failed to submit question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='p-4'>
            <p>Ask your question from {vendor.shopName}</p>
            <div className='flex items-center gap-4'>
                <input
                    className='border p-4 rounded-lg h-[50px] w-full focus:outline-none'
                    placeholder='Ask here......'
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />
                <button
                    className="h-[50px] px-8 my-8 text-lg bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </div>

            <div className='mt-6'>
                <h2 className='text-lg font-bold mb-4'>Questions & Answers</h2>
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {questions.length === 0 && !loading && <p>No questions yet.</p>}
                <ul className='space-y-4'>
                    {questions.map((q) => (
                        <li key={q._id} className='border p-4 rounded-lg'>
                            <p className='font-medium'>Q: {q.question}</p>
                            {q.answer ? (
                                <p className='text-green-500'>A: {q.answer}</p>
                            ) : (
                                <p className='text-gray-500 italic'>Awaiting response...</p>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default QuestionAnswer;
