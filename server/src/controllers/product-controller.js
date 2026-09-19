const Product = require('../models/Product');
const DealerStock = require('../models/DealerStock');
const FarmerInventory = require('../models/FarmerInventory');

// @route GET /api/products - list/search catalog, open to everyone (farmers need to browse it)
const getProducts = async (req, res, next) => {
    try {
        const { search, category, cropType, includeExpired } = req.query;
        const filter = {};

        if (search) {
            filter.name = { $regex: search, $options: 'i' }; // case-insensitive partial match
        }
        if (category) {
            filter.category = category;
        }
        if (cropType) {
            filter.cropTypes = { $elemMatch: { $regex: cropType, $options: 'i' } }; // case-insensitive crop search
        }

        // Auto-expiry filtering: Exclude products where registrationExpiry is past
        if (includeExpired !== 'true') {
            filter.$or = [
                { registrationExpiry: { $gt: new Date() } },
                { registrationExpiry: { $exists: false } },
                { registrationExpiry: null }
            ];
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

// @route DELETE /api/products/:id - admin only
const deleteProduct = async (req, res, next) => {
    try {
        const inUseByDealers = await DealerStock.exists({ product: req.params.id });
        const inUseByFarmers = await FarmerInventory.exists({ product: req.params.id });

        if (inUseByDealers || inUseByFarmers) {
            return res.status(400).json({
                message: 'This product is currently in use by dealers or farmers and cannot be deleted.',
            });
        }

        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.status(200).json({ message: 'Product deleted.' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };