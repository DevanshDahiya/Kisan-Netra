const Dealer = require('../models/Dealer');
const DealerStock = require('../models/DealerStock');

// @route GET /api/dealers/nearby?lng=&lat=&productId=&radius=
// The standout feature: find dealers near a location, optionally filtered to
// only those who stock a specific product.
const getNearbyDealers = async (req, res, next) => {
    try {
        const { lng, lat, productId, radius } = req.query;

        if (!lng || !lat) {
            return res.status(400).json({ message: 'lng and lat query parameters are required.' });
        }

        const maxDistanceMeters = radius ? Number(radius) * 1000 : 20000; // default 20km

        let dealerIdFilter = null;
        let quantityByDealer = {}; // dealerId -> quantityAvailable, used to enrich results below
        if (productId) {
            const stockEntries = await DealerStock.find({
                product: productId,
                quantityAvailable: { $gt: 0 },
            }).select('dealer quantityAvailable unit');
            dealerIdFilter = stockEntries.map((s) => s.dealer);
            stockEntries.forEach((s) => {
                quantityByDealer[s.dealer.toString()] = { quantityAvailable: s.quantityAvailable, unit: s.unit };
            });
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

        // Attach stock quantity for the filtered product, if applicable
        const enrichedDealers = dealers.map((d) => ({
            ...d,
            stockInfo: quantityByDealer[d._id.toString()] || null,
        }));

        res.status(200).json({ count: enrichedDealers.length, dealers: enrichedDealers });
    } catch (err) {
        next(err);
    }
};

// @route POST /api/dealers
// Only a logged-in dealer can create their own store profile
const createDealer = async (req, res, next) => {
    try {
        const existing = await Dealer.findOne({ user: req.user._id });
        if (existing) {
            return res.status(400).json({ message: 'You already have a store profile. Use update instead.' });
        }

        const { storeName, address, licenseNumber, longitude, latitude, contactPhone } = req.body;

        const dealer = await Dealer.create({
            user: req.user._id,
            storeName,
            address,
            licenseNumber,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude], // order matters: [lng, lat]
            },
            contactPhone,
        });

        res.status(201).json({ dealer });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/dealers/:id
const getDealer = async (req, res, next) => {
    try {
        const dealer = await Dealer.findById(req.params.id).populate('user', 'name email phone');
        if (!dealer) {
            return res.status(404).json({ message: 'Dealer not found.' });
        }
        res.status(200).json({ dealer });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/dealers/me - the logged-in dealer's own profile
const getMyDealerProfile = async (req, res, next) => {
    try {
        const dealer = await Dealer.findOne({ user: req.user._id });
        if (!dealer) {
            return res.status(404).json({ message: 'You have not created a store profile yet.' });
        }
        res.status(200).json({ dealer });
    } catch (err) {
        next(err);
    }
};

// @route PATCH /api/dealers/:id
const updateDealer = async (req, res, next) => {
    try {
        const dealer = await Dealer.findById(req.params.id);
        if (!dealer) {
            return res.status(404).json({ message: 'Dealer not found.' });
        }

        // Ownership check - same pattern as your Task Manager project
        if (dealer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only update your own store profile.' });
        }

        const { storeName, address, licenseNumber, longitude, latitude, contactPhone } = req.body;

        if (storeName) dealer.storeName = storeName;
        if (address) dealer.address = address;
        if (licenseNumber) dealer.licenseNumber = licenseNumber;
        if (contactPhone) dealer.contactPhone = contactPhone;
        if (longitude !== undefined && latitude !== undefined) {
            dealer.location.coordinates = [longitude, latitude];
        }

        await dealer.save();
        res.status(200).json({ dealer });
    } catch (err) {
        next(err);
    }
};

// @route DELETE /api/dealers/:id
const deleteDealer = async (req, res, next) => {
    try {
        const dealer = await Dealer.findById(req.params.id);
        if (!dealer) {
            return res.status(404).json({ message: 'Dealer not found.' });
        }

        if (dealer.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You can only delete your own store profile.' });
        }

        await dealer.deleteOne();
        res.status(200).json({ message: 'Dealer profile deleted.' });
    } catch (err) {
        next(err);
    }
};

// @route PATCH /api/dealers/:id/verify - admin only
const verifyDealer = async (req, res, next) => {
    try {
        const dealer = await Dealer.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        );
        if (!dealer) {
            return res.status(404).json({ message: 'Dealer not found.' });
        }
        res.status(200).json({ dealer });
    } catch (err) {
        next(err);
    }
};

module.exports = { createDealer, getDealer, getMyDealerProfile, updateDealer, deleteDealer, getNearbyDealers, verifyDealer };