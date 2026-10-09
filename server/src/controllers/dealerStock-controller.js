const Dealer = require('../models/Dealer');
const DealerStock = require('../models/DealerStock');

// Helper : confirms the logged-in user owns the dealer profile at :dealerId
const verifyOwnership = async (dealerId, userId) => {
    const dealer = await Dealer.findById(dealerId);
    if (!dealer) {
        return {
            error: 'Dealer not found',
            status: 404
        };
    }
    if (dealer.user.toString() !== userId.toString()) {
        return {
            error: 'You can only manage stock for your own store.',
            status: 403
        };
    }
    return { dealer };
};

// Create / Update (upsert) dealer stock
// if stock for same product exists -> update quantity
// else create new stock entry
// Validate price helper
const validatePrice = (price) => {
    if (price === null || price === undefined) return null;
    if (typeof price !== 'number' || !Number.isFinite(price) || Number.isNaN(price)) {
        return 'Price must be a valid finite number.';
    }
    if (price < 0) {
        return 'Price cannot be negative.';
    }
    if (price > 1000000) {
        return 'Price cannot exceed 1,000,000.';
    }
    const parts = price.toString().split('.');
    if (parts.length > 1 && parts[1].length > 2) {
        return 'Price cannot have more than 2 decimal places.';
    }
    return null;
};

// GET /api/dealers/:id/stock - public , farmer need to see what a store carries 
const getDealerStock = async (req, res, next) => {
    try {
        const stock = await DealerStock.find({ dealer: req.params.id }).populate(
            'product',
            'name category licenseNumber activeIngredient'
        );
        res.status(200).json({
            count: stock.length,
            stock
        });
    }
    catch (err) {
        next(err);
    }
};

// POST /api/dealers/:id/stock 
const addStock = async (req, res, next) => {
    try {
        const ownerShip = await verifyOwnership(req.params.id, req.user._id);
        if (ownerShip.error) {
            return res.status(ownerShip.status).json({
                message: ownerShip.error
            });
        }
        const { product, quantityAvailable, unit, price, minimumStockThreshold } = req.body;

        let validatedPrice = null;
        let priceUpdatedAt = null;
        if (price !== undefined && price !== null && price !== '') {
            const priceErr = validatePrice(price);
            if (priceErr) {
                return res.status(400).json({ message: priceErr });
            }
            validatedPrice = Number(price);
            priceUpdatedAt = new Date();
        }

        const stockItem = await DealerStock.create({
            dealer: req.params.id,
            product,
            quantityAvailable,
            unit,
            price: validatedPrice,
            priceUpdatedAt,
            minimumStockThreshold: minimumStockThreshold !== undefined ? Number(minimumStockThreshold) : 10,
        });
        res.status(201).json({
            stockItem
        });
    }
    catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                message: 'You already have a stock entry for this product. Use update instead.'
            });
        }
        next(err);
    }
};

// PATCH /api/dealers/:id/stock/:stockId 
const updateStock = async (req, res, next) => {
    try {
        const ownerShip = await verifyOwnership(req.params.id, req.user._id);
        if (ownerShip.error) {
            return res.status(ownerShip.status).json({
                message: ownerShip.error
            });
        }

        const updateFields = {};
        if (req.body.quantityAvailable !== undefined) updateFields.quantityAvailable = Number(req.body.quantityAvailable);
        if (req.body.unit !== undefined) updateFields.unit = req.body.unit;
        if (req.body.minimumStockThreshold !== undefined) updateFields.minimumStockThreshold = Number(req.body.minimumStockThreshold);

        if ('price' in req.body) {
            if (req.body.price === null || req.body.price === '') {
                updateFields.price = null;
                updateFields.priceUpdatedAt = new Date();
            } else {
                const priceErr = validatePrice(req.body.price);
                if (priceErr) {
                    return res.status(400).json({ message: priceErr });
                }
                updateFields.price = Number(req.body.price);
                updateFields.priceUpdatedAt = new Date();
            }
        }

        const stockItem = await DealerStock.findOneAndUpdate(
            {
                _id: req.params.stockId,
                dealer: req.params.id
            },
            updateFields,
            {
                new: true,
                runValidators: true
            }
        );
        if (!stockItem) {
            return res.status(404).json({
                message: 'Stock entry not found.'
            });
        }
        res.status(200).json({ stockItem });
    }
    catch (err) {
        next(err);
    }
};

// DELETE /api/dealers/:id/stock/:stockId 

const deleteStock = async (req, res, next) => {
    try {
        const ownerShip = await verifyOwnership(req.params.id, req.user._id);
        if (ownerShip.error) {
            return res.status(ownerShip.status).json({
                message: ownerShip.error
            });
        }

        const result = await DealerStock.findOneAndDelete({
            _id: req.params.stockId,
            dealer: req.params.id
        });
        if (!result) {
            return res.status(404).json({
                message: 'Stock entry not found'
            });
        }
        res.status(200).json({
            message: 'Stock entry deleted'
        });
    }
    catch (err) {
        next(err);
    }
};

// GET /api/dealers/analytics - Get dealer inventory metrics & low stock alerts
const getDealerAnalytics = async (req, res, next) => {
    try {
        const dealer = await Dealer.findOne({ user: req.user._id });
        if (!dealer) {
            return res.status(404).json({ message: 'Store profile not found.' });
        }

        const stockItems = await DealerStock.find({ dealer: dealer._id }).populate(
            'product',
            'name category licenseNumber activeIngredient'
        );

        let totalInventoryValue = 0;
        let outOfStockCount = 0;
        const lowStockItems = [];

        stockItems.forEach((item) => {
            const itemPrice = item.price || 0;
            totalInventoryValue += item.quantityAvailable * itemPrice;

            if (item.quantityAvailable === 0) {
                outOfStockCount++;
            }

            const threshold = item.minimumStockThreshold !== undefined ? item.minimumStockThreshold : 10;
            if (item.quantityAvailable <= threshold) {
                lowStockItems.push({
                    _id: item._id,
                    product: item.product,
                    quantityAvailable: item.quantityAvailable,
                    unit: item.unit,
                    price: itemPrice,
                    minimumStockThreshold: threshold,
                    isOutOfStock: item.quantityAvailable === 0,
                });
            }
        });

        res.status(200).json({
            totalProducts: stockItems.length,
            totalInventoryValue,
            lowStockCount: lowStockItems.length,
            outOfStockCount,
            lowStockItems,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getDealerStock, addStock, updateStock, deleteStock, getDealerAnalytics };