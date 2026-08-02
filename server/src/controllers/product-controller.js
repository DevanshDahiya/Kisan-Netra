const Product = require('../models/Product');

// @route GET /api/products - list/search catalog, open to everyone (farmers need to browse it)
const getProducts = async (req, res, next) => {
    try {
        const { search, category, cropType } = req.query;
        const filter = {};

        if (search) {
            filter.name = { $regex: search, $options: 'i' }; // case-insensitive partial match
        }
        if (category) {
            filter.category = category;
        }
        if (cropType) {
            filter.cropTypes = { $in: [cropType] }; // matches if cropType is anywhere in the array
        }

        const products = await Product.find(filter).sort({ name: 1 });
        res.status(200).json({ count: products.length, products });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/products/:id
const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(200).json({ product });
    } catch (err) {
        next(err);
    }
};

// @route POST /api/products - admin or dealer can add, product goes live immediately
const createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ product });
    } catch (err) {
        next(err);
    }
};

// @route PATCH /api/products/:id - admin only
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(200).json({ product });
    } catch (err) {
        next(err);
    }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct };