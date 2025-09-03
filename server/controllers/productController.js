const productModel = require("../models/productModel");

// Create a new product associated with the user
const createProduct = async (req, res) => {
    try {
        const { name, price, gallon, description, status, userId, dcPerKm } = req.body;
        const product = new productModel({
            name,
            price,
            dcPerKm,
            gallon,
            description,
            status,
            userId, // Associate product with logged-in user
            image: req.file ? `/uploads/${req.file.filename}` : null, // Save image path
        });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create product', error });
    }
};

// Get products associated with the logged-in user
const getUserProducts = async (req, res) => {

    try {
        const { id } = req.params;
        const products = await productModel.find({ userId: id, status: 'active' });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products', error });
    }
};
const getVendorProducts = async (req, res) => {

    try {
        const { id } = req.params;
        const products = await productModel.find({ userId: id, });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products', error });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await productModel.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products', error });
    }
};
// Update a product if the logged-in user is the owner
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await productModel.findOneAndUpdate(
            { _id: id, userId: req.body?.userId }, // Ensure user owns the product
            {
                ...req.body,
                ...(req.file && { image: `/uploads/${req.file.filename}` })
            },
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found or you are not authorized' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update product', error });
    }
};
// Delete a product if the logged-in user is the owner
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await productModel.findOneAndDelete({ _id: id, userId: req.body?.userId });
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found or you are not authorized' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product', error });
    }
};


// Toggle product status (PUT /api/products/:id/status)
const toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        console.log({ _id: id, userId: req })
        const product = await productModel.findOne({ _id: id, userId: req.body?.userId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found or you are not authorized' });
        }

        // Toggle status between 'active' and 'disabled'
        product.status = product.status === 'active' ? 'disabled' : 'active';
        await product.save();

        res.status(200).json({ message: 'Product status updated successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update product status', error });
    }
};

module.exports = {
    createProduct, deleteProduct, getUserProducts, toggleProductStatus, updateProduct, getProducts, getVendorProducts
}