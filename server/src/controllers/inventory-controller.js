const FarmerInventory = require('../models/FarmerInventory');

// GET /api/inventory - the logged-in farmer's own inventory 
const getMyInventory = async (req, res, next) => {
    try {
        const items = await FarmerInventory.find({ farmer: req.user._id })
            .populate('product', 'name category licenseNumber registrationExpiry')
            .populate('purchasedFrom', 'storeName');
        res.status(200).json({
            count: items.length,
            items
        });

    }
    catch (err) {
        next(err);
    }
};

// route POST /api/inventory 
const addInventoryItem = async (req, res, next) => {
    try {
        const { product, quantityPurchased, unit, purchaseDate, purchasedFrom } = req.body;
        const item = await FarmerInventory.create({
            farmer: req.user._id,
            product,
            quantityPurchased,
            quantityRemaining: quantityPurchased,
            unit,
            purchaseDate,
            purchasedFrom,
        });

        res.status(201).json({ item });
    }
    catch (err) {
        next(err);
    }
};

// PATCH /api/inventory/:id 
const updateInventoryItem = async (req, res, next) => {
    try {
        const item = await FarmerInventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found.' });
        }
        if (item.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You can only edit your own inventory.',
            });
        }
        const { quantityPurchased, quantityRemaining, unit, purchasedFrom } = req.body;
        if (quantityPurchased != undefined) {
            item.quantityPurchased = quantityPurchased;
        }
        if (quantityRemaining !== undefined) {
            item.quantityRemaining = quantityRemaining;
        }
        if (unit) {
            item.unit = unit;
        }
        if (purchasedFrom) {
            item.purchasedFrom = purchasedFrom;
        }
        await item.save();
        res.status(200).json({ item });
    }
    catch (err) {
        next(err);
    }
};

// route DELETE /api/inventory/:id 
const deleteInventoryItem = async (req, res, next) => {
    try {
        const item = await FarmerInventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({
                message: 'Inventory item not found.'
            })
        }
        if (item.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You can only delete your own inventory'
            });
        }

        await item.deleteOne();
        res.status(200).json({
            message: 'Inventory item deleted.'
        });
    }
    catch (err) {
        next(err);
    }
};

// route POST /api/inventory/:id/usage -> log a usage evvent , auto-decrements remaining stock 
const logUsage = async (req, res, next) => {
    try {
        const item = await FarmerInventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({
                message: 'Inventory item not found.'
            });
        }
        if (item.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You can only log usage for your own inventory.'
            });
        }
        const { quantityUsed, cropApplied, notes } = req.body;
        if (quantityUsed > item.quantityRemaining) {
            return res.status(400).json({
                message: 'Cannot use more than what reamins in stock.'
            });
        }
        item.usageLog.push({ quantityUsed, cropApplied, notes });
        item.quantityRemaining -= quantityUsed;
        await item.save();

        res.status(200).json({ item });

    }
    catch (err) {
        next(err);
    }
};

// GET /api/inventory/alerts - computed on-request, no background job needed
const getAlerts = async (req, res, next) => {
    try {
        const LOW_STOCK_THRESHOLD_RATIO = 0.2; // flag when remaining < 20% of purchased 
        const EXPIRY_WARNING_DAYS = 30;

        const items = await FarmerInventory.find({
            farmer: req.user._id
        }).populate(
            'product',
            'name registrationExpiry'
        );
        const now = new Date();
        const expiryCutoff = new Date(now.getTime() + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000);
        const lowStock = items.filter(
            (i) => i.quantityRemaining <= i.quantityPurchased * LOW_STOCK_THRESHOLD_RATIO);

        const expirySoon = items.filter(
            (i) =>
                i.product?.registrationExpiry &&
                new Date(i.product.registrationExpiry) <= expiryCutoff &&
                new Date(i.product.registrationExpiry) >= now
        );
        res.status(200).json({ lowStock, expirySoon });
    }
    catch (err) {
        next(err);
    }
};

module.exports = {
    getMyInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    logUsage,
    getAlerts,
};
