const CustomerOrder = require('../models/CustomerOrders');

// Function to update the status of an order
const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    // Check if the provided status is valid
    const validStatuses = ['pending', 'process', 'completed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided' });
    }

    try {
        // Find the order and update the status
        const order = await CustomerOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update status
        order.status = status;
        await order.save();

        res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: 'Error updating order status', error });
    }
};


// Function to get orders by venderId
const getOrdersByVendor = async (req, res) => {
    const { venderId } = req.params;

    try {
        // Find orders associated with the provided venderId
        const orders = await CustomerOrder.find({ venderId }).populate('productId').populate('venderId');
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this vendor' });
        }

        res.status(200).json({ message: 'Orders retrieved successfully', orders });
    } catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).json({ message: 'Error retrieving orders', error });
    }
};
const getOrdersByUser = async (req, res) => {
    const { userid } = req.params;

    try {
        const orders = await CustomerOrder.find({ userid }).populate('productId').populate('venderId');
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this User' });
        }

        res.status(200).json({ message: 'Orders retrieved successfully', orders });
    } catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).json({ message: 'Error retrieving orders', error });
    }
};

module.exports = { updateOrderStatus, getOrdersByVendor, getOrdersByUser }