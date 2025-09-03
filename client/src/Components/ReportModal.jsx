import React, { useState } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import axios from 'axios'; // Axios for API calls

const ReportModal = ({ children, vendorId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const data = localStorage.getItem('loginData') && JSON.parse(localStorage.getItem('loginData'))?.data
    console.log(data)
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (values) => {
        try {
            const payload = {
                ...values,
                venderId: vendorId,
                userid: data?._id

            }
            const response = await axios.post('http://localhost:8000/api/user/add-report', payload);

            if (response.status === 201) {
                message.success('Report submitted successfully!');
                setIsModalOpen(false);
                form.resetFields();
            }
        } catch (error) {
            message.error('Failed to submit the report!');
            console.error('Error:', error);
        }
    };

    return (
        <>
            <div onClick={showModal}>
                {children}
            </div>

            <Modal
                title="Report Something"
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                maskClosable={false}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[
                            { required: true, message: 'Please enter a title!' },
                            { max: 100, message: 'Title cannot be longer than 100 characters' },
                        ]}
                    >
                        <Input placeholder="Enter the title" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[
                            { required: true, message: 'Please enter a description!' },
                            { max: 500, message: 'Description cannot be longer than 500 characters' },
                        ]}
                    >
                        <Input.TextArea placeholder="Enter the description" rows={4} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default ReportModal;
