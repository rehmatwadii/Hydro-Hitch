import React, { useState, useEffect } from 'react';
import { Container, Stack, Typography } from '@mui/material';
import { Space, Table, Tag, message } from 'antd';
import axios from 'axios';

export default function ProductOrderPage() {
    const [orders, setOrders] = useState([]);

    // Fetch orders from the backend
    const fetchOrders = async () => {
        const loginData = JSON.parse(localStorage.getItem('loginData'));
        const venderId = loginData?.data?._id;

        if (!venderId) {
            message.error('Vendor ID not found!');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8000/api/vender/${venderId}/orders`);
            const transformedOrders = response.data.orders.map((order) => ({
                key: order._id,
                orderId: order._id,
                customerName: order.CustomerName,
                product: order.productId.name,
                quantity: order.productId.gallon,
                price: order.Price,
                status: order.status,
            }));
            setOrders(transformedOrders);
        } catch (error) {
            message.error('Error fetching orders');
            console.error(error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Function to handle status updates
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const response = await axios.put(`http://localhost:8000/api/vender/order/${orderId}/status`, {
                status: newStatus,
            });

            if (response.status === 200) {
                message.success(`Order ${newStatus} successfully!`);
                fetchOrders(); // Refresh the orders list
            }
        } catch (error) {
            message.error(`Failed to update order status: ${error.response?.data?.message || error.message}`);
            console.error(error);
        }
    };

    // Helper function to get tag color based on status
    const getStatusTagColor = (status) => {
        const colorMap = {
            pending: 'orange',
            process: 'blue',
            completed: 'green'
        };
        return colorMap[status] || 'default';
    };

    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'key',
            key: 'orderId',
        },
        {
            title: 'Customer Name',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Product',
            dataIndex: 'product',
            key: 'product',
        },
        {
            title: 'Gallon',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusTagColor(status)}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {record.status === 'pending' && (
                        <>
                            <a onClick={() => handleStatusUpdate(record.key, 'process')}>Process</a>
                            <a onClick={() => handleStatusUpdate(record.key, 'completed')}>Complete</a>
                        </>
                    )}
                    {record.status === 'process' && (
                        <a onClick={() => handleStatusUpdate(record.key, 'completed')}>Complete</a>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Container>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Orders</Typography>
            </Stack>

            <Table
                columns={columns}
                dataSource={orders}
                rowKey="orderId"
            />
        </Container>
    );
}