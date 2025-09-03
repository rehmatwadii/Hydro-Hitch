import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar';
// import { Badge } from "@/components/ui/badge";

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        const isAuthenticated = localStorage.getItem('loginData') && JSON.parse(localStorage.getItem('loginData'))?.data;
        const userData = isAuthenticated ? JSON.parse(localStorage.getItem('loginData'))?.data : null;

        if (!userData) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/user/order/${userData._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userData.token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
                {loading ? (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                ) : orders.length > 0 ? (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <OrderCard key={order._id} order={order} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                        <p className="mt-2 text-gray-500">When you place orders, they will appear here.</p>
                    </div>
                )}
            </div>
        </>
    );
};

const OrderCard = ({ order }) => {
    const getStatusColor = (status) => {
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'default': 'bg-gray-100 text-gray-800'
        };
        return statusColors[status?.toLowerCase()] || statusColors.default;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="text-sm font-medium text-gray-900">{order._id}</p>
                    </div>
                    <div variant="outline" className={`${getStatusColor(order.status)} px-3 py-1 rounded-full text-sm`}>
                        {order.status}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Product Details</h3>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600">{order.productId?.name}</p>
                            <p className="text-sm font-medium text-gray-900">{order.Price} PKR</p>
                            <p className="text-sm text-gray-600">{order.productId?.gallon} gallons</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Vendor Details</h3>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600">{order.venderId?.shopName}</p>
                            <p className="text-sm text-gray-600">{order.venderId?.email}</p>
                            <p className="text-sm text-gray-600">{order.venderId?.phone}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderList;