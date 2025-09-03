import React, { useState, useEffect } from 'react';
import { Container, Stack, Typography, } from '@mui/material';
import { Table, Tag, message } from 'antd'; // Ant Design components
import axios from 'axios';

export default function UserReportVendor() {
    const [reports, setReports] = useState([]); // State to store report data

    // Fetch reports from the backend based on the vendor ID (from localStorage)
    const fetchReports = async () => {
        const loginData = JSON.parse(localStorage.getItem('loginData'));
        const venderId = loginData?.data?._id; // Use the vendor ID from localStorage

        if (!venderId) {
            message.error('Vendor ID not found!');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8000/api/user/get-report`);
            const transformedReports = response.data.map((report) => ({
                key: report._id,
                reportId: report._id,
                title: report.title,
                description: report.description,
                user: report.userid?.name || 'Unknown User',
                shopName: report.venderId?.shopName || 'Unknown Shop',
            }));
            setReports(transformedReports);
        } catch (error) {
            message.error('Error fetching reports');
            console.error(error);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // Table columns for displaying reports
    const columns = [
        {
            title: 'Report ID',
            dataIndex: 'reportId',
            key: 'reportId',
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
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

    ];

    return (
        <Container>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">User Reports</Typography>
            </Stack>

            <Table
                columns={columns}
                dataSource={reports}
                rowKey="reportId"
                pagination={{ pageSize: 10 }}
            />
        </Container>
    );
}
