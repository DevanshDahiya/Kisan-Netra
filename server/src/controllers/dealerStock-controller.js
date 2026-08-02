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
        const { product, quantityAvailable, unit } = req.body;
        const stockItem = await DealerStock.create({
            dealer: req.params.id,
            product,
            quantityAvailable,
            unit,
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
        const stockItem = await DealerStock.findOneAndUpdate(
            {
                _id: req.params.stockId,
                dealer: req.params.id
            },
            {
                quantityAvailable: req.body.quantityAvailable,
                unit: req.body.unit
            },
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

module.exports = { getDealerStock, addStock, updateStock, deleteStock };