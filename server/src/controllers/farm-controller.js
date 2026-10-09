const Farm = require('../models/Farm');

// GET /api/farms - Get all farms for logged-in farmer
const getMyFarms = async (req, res, next) => {
    try {
        const farms = await Farm.find({ farmer: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ count: farms.length, farms });
    } catch (err) {
        next(err);
    }
};

// GET /api/farms/:id - Get single farm profile
const getFarmById = async (req, res, next) => {
    try {
        const farm = await Farm.findById(req.params.id);
        if (!farm) {
            return res.status(404).json({ message: 'Farm profile not found.' });
        }
        if (farm.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to access this farm profile.' });
        }
        res.status(200).json({ farm });
    } catch (err) {
        next(err);
    }
};

// POST /api/farms - Create a farm profile
const createFarm = async (req, res, next) => {
    try {
        const { farmName, locationName, longitude, latitude, totalArea, areaUnit, soilType, irrigationType, notes } = req.body;

        const coordinates = [
            longitude !== undefined ? Number(longitude) : 0,
            latitude !== undefined ? Number(latitude) : 0,
        ];

        const farm = await Farm.create({
            farmer: req.user._id,
            farmName,
            locationName: locationName || '',
            location: {
                type: 'Point',
                coordinates,
            },
            totalArea: Number(totalArea),
            areaUnit: areaUnit || 'acres',
            soilType: soilType || 'Loam',
            irrigationType: irrigationType || 'Rainfed',
            notes: notes || '',
        });

        res.status(201).json({ farm });
    } catch (err) {
        next(err);
    }
};

// PUT /api/farms/:id - Update farm profile
const updateFarm = async (req, res, next) => {
    try {
        const farm = await Farm.findById(req.params.id);
        if (!farm) {
            return res.status(404).json({ message: 'Farm profile not found.' });
        }
        if (farm.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only update your own farm profiles.' });
        }

        const { farmName, locationName, longitude, latitude, totalArea, areaUnit, soilType, irrigationType, notes } = req.body;

        if (farmName !== undefined) farm.farmName = farmName;
        if (locationName !== undefined) farm.locationName = locationName;
        if (totalArea !== undefined) farm.totalArea = Number(totalArea);
        if (areaUnit !== undefined) farm.areaUnit = areaUnit;
        if (soilType !== undefined) farm.soilType = soilType;
        if (irrigationType !== undefined) farm.irrigationType = irrigationType;
        if (notes !== undefined) farm.notes = notes;

        if (longitude !== undefined && latitude !== undefined) {
            farm.location = {
                type: 'Point',
                coordinates: [Number(longitude), Number(latitude)],
            };
        }

        await farm.save();
        res.status(200).json({ farm });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/farms/:id - Delete farm profile
const deleteFarm = async (req, res, next) => {
    try {
        const farm = await Farm.findById(req.params.id);
        if (!farm) {
            return res.status(404).json({ message: 'Farm profile not found.' });
        }
        if (farm.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own farm profiles.' });
        }

        await farm.deleteOne();
        res.status(200).json({ message: 'Farm profile deleted.' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getMyFarms,
    getFarmById,
    createFarm,
    updateFarm,
    deleteFarm,
};
