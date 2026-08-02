const Dealer = require('../models/Dealer');
const DealerStock = require('../models/DealerStock');

// route GET /api/dealers/nearby?lng=&productId=&radius=

const getNearbyDealers = async (req, res, next) => {
    try {
        const { lng, lat, productId, radius } = req.query;

        if (!lng || !lat) {
            return res.status(400).json({ message: 'lng and lat query parameters are required.' });
        }

        const maxDistanceMeters = radius ? Number(radius) * 1000 : 20000; // default 20km

        let dealerIdFilter = null;
        if (productId) {
            const stockEntries = await DealerStock.find({
                product: productId,
                quantityAvailable: { $gt: 0 },
            }).select('dealer');
            dealerIdFilter = stockEntries.map((s) => s.dealer);
        }

        // $geoNear must be the first stage in the pipeline, and it requires the
        // 2dsphere index. It returns a "distance" field (in meters) on each result -
        // that's the reason to use aggregation here instead of a plain find() + $near.

        const pipeline = [
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
                    distanceField: 'distance',
                    maxDistance: maxDistanceMeters,
                    spherical: true,
                    query: {
                        isVerified: true,
                        ...(dealerIdFilter ? { _id: { $in: dealerIdFilter } } : {}),
                    },
                },
            },
            { $limit: 20 },
        ];

        const dealers = await Dealer.aggregate(pipeline);
        res.status(200).json({
            count: dealers.length,
            dealers
        });
    }
    catch (err) {
        next(err);
    }
};



// firstly , only loggedin user can create  their own store profile 
// route - > POST /api/dealer

const createDealer = async (req, res, next) => {
    try {
        const existing = await Dealer.findOne({ user: req.user._id });
        if (existing) {
            return res.status(400).json({
                message: 'You already have a store profile. Use update instead.'
            });
        }
        const { storeName, address, licenseNumber, longitude, latitude, contactPhone } = req.body;
        const dealer = await Dealer.create({
            user: req.user._id,
            storeName,
            address,
            licenseNumber,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude],
            },
            contactPhone,

        });
        res.status(201).json({ dealer });
    }
    catch (err) {
        next(err);
    }
};

// route GET /api/dealers/:id 
const getDealer = async (req, res, next) => {
    try {
        const dealer = await Dealer.findById(req.params.id).populate('user', 'name email phone');
        if (!dealer) {
            return res.status(404).json({
                message: 'Dealer not found',
            });
        }
        res.status(200).json({ dealer });
    }
    catch (err) {
        next(err);
    }
};

// GET /api/dealers/me - own dealer profile 
const getMyDealerProfile = async (req, res, next) => {
    try {
        const dealer = await Dealer.findOne({ user: req.user._id });
        if (!dealer) {
            return res.status(404).json({
                message: 'You have not created a store profile yet',
            });
        }
        res.status(200).json({ dealer });
    }
    catch (err) {
        next(err);
    }
};

// route PATCH /api/dealers/:id 

const updateDealer = async (req, res, next) => {
    try {
        const dealer = await Dealer.findById(req.params.id);
        if (!dealer) {
            return res.status(404).json({
                message: 'Dealer not found',
            });
        }
        // check if it is your store or not 
        if (dealer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You can only update your own store profile"
            });
        }
        const { storeName, address, licenseNumber, longitude, latitude, contactPhone } = req.body;

        if (storeName) {
            dealer.storeName = storeName;
        }
        if (address) {
            dealer.address = address
        }
        if (licenseNumber) {
            dealer.licenseNumber = licenseNumber
        }
        if (contactPhone) {
            dealer.contactPhone = contactPhone
        }
        if (longitude !== undefined && latitude !== undefined) {
            dealer.location.coordinates = [longitude, latitude];
        }

        await dealer.save();
        res.status(200).json({ dealer });
    }
    catch (err) {
        next(err);
    }
};

// DELETE /api/delaers/:id 
const deleteDealer = async (req, res, next) => {
    try {
        const dealer = await Dealer.findById(req.params.id);
        if (!dealer) {
            return res.status(404).json({
                message: 'Dealer not found.'
            });
        }
        if (dealer.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'You can only delete your own store profile.'
            });
        }
        await dealer.deleteOne();
        res.status(200).json({
            message: 'Dealer profile deleted.'
        });
    }
    catch (err) {
        next(err);
    }
};

// PATCH /api/dealers/:id/verify - admin only
const verifyDealer = async (req, res, next) => {
    try {
        const dealer = await Dealer.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        );
        if (!dealer) {
            return res.status(404).json({
                message: 'Dealer not found.'
            });
        }
        res.status(200).json({ dealer });
    }
    catch (err) {
        next(err);
    }
};



module.exports = {
    createDealer,
    getDealer,
    getMyDealerProfile,
    updateDealer,
    deleteDealer,
    getNearbyDealers,
    verifyDealer,
};