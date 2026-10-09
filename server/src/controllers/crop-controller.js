const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const FarmerInventory = require('../models/FarmerInventory');

// GET /api/crops - Get farmer's crops (optional query ?farmId=...)
const getMyCrops = async (req, res, next) => {
    try {
        const query = { farmer: req.user._id };
        if (req.query.farmId) {
            query.farm = req.query.farmId;
        }
        if (req.query.status) {
            query.status = req.query.status;
        }

        const crops = await Crop.find(query)
            .populate('farm', 'farmName totalArea areaUnit')
            .populate('activities.inventoryItem', 'product quantityRemaining unit')
            .sort({ createdAt: -1 });

        res.status(200).json({ count: crops.length, crops });
    } catch (err) {
        next(err);
    }
};

// GET /api/crops/:id - Get single crop with populated activity details
const getCropById = async (req, res, next) => {
    try {
        const crop = await Crop.findById(req.params.id)
            .populate('farm', 'farmName locationName totalArea areaUnit soilType irrigationType')
            .populate({
                path: 'activities.inventoryItem',
                populate: { path: 'product', select: 'name category' },
            });

        if (!crop) {
            return res.status(404).json({ message: 'Crop record not found.' });
        }
        if (crop.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to access this crop record.' });
        }

        res.status(200).json({ crop });
    } catch (err) {
        next(err);
    }
};

// POST /api/crops - Create crop record
const createCrop = async (req, res, next) => {
    try {
        const { farm, cropName, variety, sowingDate, expectedHarvestDate, currentStage, notes } = req.body;

        // Verify farm belongs to farmer
        const farmDoc = await Farm.findById(farm);
        if (!farmDoc) {
            return res.status(404).json({ message: 'Farm profile not found.' });
        }
        if (farmDoc.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only add crops to your own farm profiles.' });
        }

        const crop = await Crop.create({
            farmer: req.user._id,
            farm,
            cropName,
            variety: variety || '',
            sowingDate,
            expectedHarvestDate,
            currentStage: currentStage || 'Sowing',
            notes: notes || '',
        });

        res.status(201).json({ crop });
    } catch (err) {
        next(err);
    }
};

// PUT /api/crops/:id - Update crop details or stage
const updateCrop = async (req, res, next) => {
    try {
        const crop = await Crop.findById(req.params.id);
        if (!crop) {
            return res.status(404).json({ message: 'Crop record not found.' });
        }
        if (crop.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only update your own crop records.' });
        }

        const { cropName, variety, sowingDate, expectedHarvestDate, currentStage, notes, status } = req.body;

        if (cropName !== undefined) crop.cropName = cropName;
        if (variety !== undefined) crop.variety = variety;
        if (sowingDate !== undefined) crop.sowingDate = sowingDate;
        if (expectedHarvestDate !== undefined) crop.expectedHarvestDate = expectedHarvestDate;
        if (currentStage !== undefined) crop.currentStage = currentStage;
        if (notes !== undefined) crop.notes = notes;
        if (status !== undefined) crop.status = status;

        await crop.save();
        res.status(200).json({ crop });
    } catch (err) {
        next(err);
    }
};

// POST /api/crops/:id/activities - Log activity on crop
const addCropActivity = async (req, res, next) => {
    try {
        const crop = await Crop.findById(req.params.id);
        if (!crop) {
            return res.status(404).json({ message: 'Crop record not found.' });
        }
        if (crop.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only add activities to your own crops.' });
        }

        const { date, activityType, description, inventoryItem, quantityUsed } = req.body;

        // If inventory item is provided and quantity is specified, optionally auto-log inventory usage!
        if (inventoryItem && quantityUsed > 0) {
            const inv = await FarmerInventory.findById(inventoryItem);
            if (inv && inv.farmer.toString() === req.user._id.toString()) {
                if (quantityUsed > inv.quantityRemaining) {
                    return res.status(400).json({
                        message: `Cannot use ${quantityUsed} ${inv.unit}. Only ${inv.quantityRemaining} ${inv.unit} available in inventory.`,
                    });
                }
                inv.usageLog.push({
                    date: date || new Date(),
                    quantityUsed,
                    cropApplied: crop.cropName,
                    notes: `Logged via Crop Activity: ${description}`,
                });
                inv.quantityRemaining -= quantityUsed;
                await inv.save();
            }
        }

        crop.activities.push({
            date: date || new Date(),
            activityType: activityType || 'Other',
            description,
            inventoryItem: inventoryItem || undefined,
            quantityUsed: quantityUsed ? Number(quantityUsed) : 0,
        });

        await crop.save();
        res.status(200).json({ crop });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/crops/:id - Delete crop record
const deleteCrop = async (req, res, next) => {
    try {
        const crop = await Crop.findById(req.params.id);
        if (!crop) {
            return res.status(404).json({ message: 'Crop record not found.' });
        }
        if (crop.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own crop records.' });
        }

        await crop.deleteOne();
        res.status(200).json({ message: 'Crop record deleted.' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getMyCrops,
    getCropById,
    createCrop,
    updateCrop,
    addCropActivity,
    deleteCrop,
};
