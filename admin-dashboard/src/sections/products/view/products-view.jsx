import React, { useState, useEffect } from 'react';
import { Typography, message, Space } from 'antd';
import { Table, Button, Modal, Input, Upload, Popconfirm } from 'antd';
import { EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

// Assuming user data is stored in localStorage
const userId = localStorage.getItem('loginData') && JSON.parse(localStorage.getItem('loginData')).data._id;
const token = localStorage.getItem('loginData') && JSON.parse(localStorage.getItem('loginData')).data.token;

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    price: '',
    dcPerKm: 0,
    gallon: '',
    description: '',
    status: 'active',
  });
  const [image, setImage] = useState(null); // To store the selected file
  // Fetch products for the logged-in user
  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/vender/products/vendor/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Open modal for adding/editing product
  const openModal = (product = { name: '', price: '', gallon: '', description: '', status: 'active', dcPerKm: 0 }) => {
    setCurrentProduct(product);
    setIsEditing(!!product._id);
    setImage(null); // Reset the image
    setIsModalOpen(true);
  };

  // Save product (add or update)
  const handleSaveProduct = async () => {
    const url = isEditing
      ? `http://localhost:8000/api/vender/products/${currentProduct._id}`
      : 'http://localhost:8000/api/vender/products';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const formData = new FormData();
      formData.append('name', currentProduct.name);
      formData.append('price', currentProduct.price);
      formData.append('dcPerKm', currentProduct.dcPerKm);
      formData.append('gallon', currentProduct.gallon);
      formData.append('description', currentProduct.description);
      formData.append('status', currentProduct.status);
      formData.append('userId', userId);

      if (image) {
        formData.append('image', image); // Attach the selected image
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (isEditing) {
        setProducts(products.map((prod) => (prod._id === data._id ? data : prod)));
      } else {
        setProducts([...products, data]);
      }
      message.success(`Product ${isEditing ? 'updated' : 'added'} successfully`);
      setIsModalOpen(false);
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} product:`, error);
      message.error(`Failed to ${isEditing ? 'update' : 'add'} product`);
    }
  };

  const handleChange = (e) => {
    setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.value });
  };

  const handleImageChange = (info) => {
    // Only retain the first file if multiple files are accidentally added
    const file = info.fileList[0];
    if (!file) {
      setImage(null);
      return;
    }
    console.log(file)
    setImage(file?.originFileObj);
    message.success(`Selected file: ${file.name}`);
  };
  const toggleStatus = async (productId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/vender/products/${productId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(products.map(prod =>
          prod._id === productId
            ? { ...prod, status: prod.status === 'active' ? 'disabled' : 'active' }
            : prod
        ));
        message.success('Product status updated successfully');
      } else {
        message.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      message.error('Failed to update product status');
    }
  };

  const columns = [
    { title: 'Tanker Name', dataIndex: 'name', key: 'name' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Delivery Fee/km in PKR', dataIndex: 'dcPerKm', key: 'dcPerKm' },
    { title: 'Gallon', dataIndex: 'gallon', key: 'gallon' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm title="Update the Status of this product?" onConfirm={() => toggleStatus(record._id)}>
            <Button>Change Status</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => openModal()}
      >
        Add Tanker
      </Button>
      <Table columns={columns} dataSource={products} rowKey="_id" />

      {/* Product Modal */}
      <Modal
        title={`${isEditing ? 'Edit' : 'Add'} Product`}
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSaveProduct}
      >
        <Input
          placeholder="Name"
          name="name"
          value={currentProduct.name}
          onChange={handleChange}
          style={{ marginBottom: '1em' }}
        />
        <Input
          placeholder="Price"
          name="price"
          value={currentProduct.price}
          onChange={handleChange}
          style={{ marginBottom: '1em' }}
        />
        <Input
          type='number'
          placeholder="Delivery Charges/km for this tanker"
          name="dcPerKm"
          value={currentProduct.dcPerKm}
          onChange={handleChange}
          style={{ marginBottom: '1em' }}
        />
        <Input
          placeholder="Gallon"
          name="gallon"
          value={currentProduct.gallon}
          onChange={handleChange}
          style={{ marginBottom: '1em' }}
        />
        <Input
          placeholder="Description"
          name="description"
          value={currentProduct.description}
          onChange={handleChange}
          style={{ marginBottom: '1em' }}
        />
        <Upload
          beforeUpload={() => false} // Prevent automatic upload
          onChange={handleImageChange}
          accept=".png,.jpg,.jpeg,.gif"
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Select Image</Button>
        </Upload>
      </Modal>
    </div>
  );
}
