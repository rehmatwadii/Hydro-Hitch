import React, { useState, useEffect } from 'react';
import { Container, Stack, Typography, Button, Modal, Input } from '@mui/material';
import { Table, message } from 'antd';
import axios from 'axios';

export default function UserQuestion() {
    const [questions, setQuestions] = useState([]); // State to store questions
    const [loading, setLoading] = useState(false); // Loading state
    const [answerModal, setAnswerModal] = useState(false); // Modal state
    const [currentQuestion, setCurrentQuestion] = useState(null); // Selected question to answer
    const [answer, setAnswer] = useState(''); // Answer input field

    // Fetch questions from the backend for the current vendor
    const fetchQuestions = async () => {
        const loginData = JSON.parse(localStorage.getItem('loginData'));
        const vendorId = loginData?.data?._id;

        if (!vendorId) {
            message.error('Vendor ID not found!');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/user/questions/${vendorId}`);
            const transformedQuestions = response.data.map((question) => ({
                key: question._id,
                id: question._id,
                question: question.question,
                answer: question.answer,
                user: question.userId?.name || 'Unknown User',
                shopName: question.vendorId?.shopName || 'Unknown Shop',
            }));
            setQuestions(transformedQuestions);
        } catch (error) {
            message.error('Error fetching questions');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    // Open the modal to answer a question
    const handleAnswer = (record) => {
        setCurrentQuestion(record);
        setAnswer('');
        setAnswerModal(true);
    };

    // Submit the answer to the backend
    const submitAnswer = async () => {
        const loginData = JSON.parse(localStorage.getItem('loginData'));
        const vendorId = loginData?.data?._id;
        if (!answer.trim()) {
            message.error('Answer cannot be empty');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8000/api/user/questions/answer/${currentQuestion.id}`,
                { answer, vendorId }
            );
            message.success('Answer submitted successfully');
            fetchQuestions(); // Refresh the question list
            setAnswerModal(false); // Close modal
        } catch (error) {
            message.error('Failed to submit answer');
            console.error(error);
        }
    };

    // Table columns
    const columns = [
        {
            title: 'Question',
            dataIndex: 'question',
            key: 'question',
        },
        {
            title: 'Answer',
            dataIndex: 'answer',
            key: 'answer',
            render: (text) => (text ? text : <span style={{ color: 'red' }}>Unanswered</span>),
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
        },
        {
            title: 'Shop',
            dataIndex: 'shopName',
            key: 'shopName',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) =>
                !record.answer && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAnswer(record)}
                    >
                        Answer
                    </Button>
                ),
        },
    ];

    return (
        <Container>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">User Questions</Typography>
            </Stack>

            <Table
                columns={columns}
                dataSource={questions}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* Modal for answering questions */}
            <Modal
                open={answerModal}
                onClose={() => setAnswerModal(false)}
                aria-labelledby="answer-modal"
                aria-describedby="answer-modal-description"
            >
                <div style={{ padding: '20px', background: 'white', borderRadius: '8px', margin: 'auto', marginTop: '100px', width: '400px' }}>
                    <Typography variant="h6">Answer Question</Typography>
                    <Typography variant="body1" style={{ margin: '10px 0' }}>
                        Q: {currentQuestion?.question}
                    </Typography>
                    <Input
                        placeholder="Enter your answer here..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        style={{ marginBottom: '20px' }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={submitAnswer}
                        disabled={!answer.trim()}
                        style={{ marginRight: '10px' }}
                    >
                        Submit
                    </Button>
                    <Button variant="outlined" onClick={() => setAnswerModal(false)}>
                        Cancel
                    </Button>
                </div>
            </Modal>
        </Container>
    );
}
