const Dealer = require('../models/Dealer');

// firstly , only loggedin user can create  their own store profile 
// route - > POST /api/dealer

const createDealer = async (req, res, next) => {
    try {
        const existing = await Dealer.findOne({ user: req.user._id });
        if (existing) {
            return res.status(400).json({
                message: 'You already hav ea store profile.'
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

module.exports = {
    createDealer,
    getDealer,
    getMyDealerProfile,
    updateDealer,
    deleteDealer,
};