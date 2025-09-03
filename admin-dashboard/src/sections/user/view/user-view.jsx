// import React, { useState, useEffect } from 'react';
// import { Container, Stack, Typography, Button, Box } from '@mui/material';
// import { Space, Table, Tag, Modal, message } from 'antd'; // Ant Design components
// import axios from 'axios';
import React, { useState, useEffect } from "react";
import { Container, Stack, Typography } from "@mui/material";
import { Space, Table, Tag, Modal, message } from "antd";
import axios from "axios";

export default function ProductOrderPage() {
  const [vendors, setVendors] = useState([]); // State to store vendors
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Fetch vendor data
  const fetchVendors = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/vender/vendors");
      const transformedData = response.data.allVendors.map((vendor) => ({
        key: vendor._id,
        shopName: vendor.shopName,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.shopAddress,
        status: vendor.status,
        reviews: vendor.TotalReviews,
        rating: vendor.OverAllRating,
      }));
      setVendors(transformedData);
    } catch (error) {
      message.error("Error fetching vendors");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Handle Approve Status
  const handleApprove = async (vendorId) => {
    try {
      const response = await axios.post(`http://localhost:8000/api/vender/vendors/${vendorId}/status`, {
        status: "approved",
      });
      if (response.status === 200) {
        message.success("Vendor approved!");
        fetchVendors();
      }
    } catch (error) {
      message.error("Failed to approve vendor");
      console.error(error);
    }
  };

  // Handle Reject Status
  const handleReject = async (vendorId) => {
    try {
      const response = await axios.post(`http://localhost:8000/api/vender/vendors/${vendorId}/status`, {
        status: "disabled",
      });
      if (response.status === 200) {
        message.success("Vendor rejected!");
        fetchVendors();
      }
    } catch (error) {
      message.error("Failed to reject vendor");
      console.error(error);
    }
  };

  // Handle View Details
  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVendor(null);
  };

  // Table Columns
  const columns = [
    { title: "Shop Name", dataIndex: "shopName", key: "shopName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Address", dataIndex: "address", key: "address" },
    {
      title: "Status", dataIndex: "status", key: "status",
      render: (status) => {
        let color = status === "pending" ? "orange" : status === "approved" ? "green" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: "Reviews", dataIndex: "reviews", key: "reviews" },
    { title: "Rating", dataIndex: "rating", key: "rating" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {record.status === "pending" || record.status === 'disabled' && (
            <>
              <a onClick={() => handleApprove(record.key)}>Approve</a>
            </>
          )}
          {record.status !== "disabled" && (<a onClick={() => handleReject(record.key)}>Suspend</a>)}
        </Space>
      ),
    },
  ];

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Vendors List</Typography>
      </Stack>

      <Table
        columns={columns}
        dataSource={vendors}
        rowKey="key"
      />

      {/* Modal for Vendor Details */}
      {selectedVendor && (
        <Modal
          title={`Vendor Details: ${selectedVendor.shopName}`}
          open={isModalOpen}
          onCancel={handleCloseModal}
          footer={null}
        >
          <p><strong>Email:</strong> {selectedVendor.email}</p>
          <p><strong>Phone:</strong> {selectedVendor.phone}</p>
          <p><strong>Address:</strong> {selectedVendor.address}</p>
          <p><strong>Status:</strong> {selectedVendor.status}</p>
          <p><strong>Reviews:</strong> {selectedVendor.reviews}</p>
          <p><strong>Rating:</strong> {selectedVendor.rating}</p>
        </Modal>
      )}
    </Container>
  );
}
