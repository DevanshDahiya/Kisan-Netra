const Dealer = require('../models/Dealer');

// @route GET /api/admin/dealers/pending
const getPendingDealers = async (req, res, next) => {
    try {
        const dealers = await Dealer.find({ isVerified: false }).populate('user', 'name email phone');
        res.status(200).json({ count: dealers.length, dealers });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/admin/dealers/verified - useful for an "all approved stores" view too
const getVerifiedDealers = async (req, res, next) => {
    try {
        const dealers = await Dealer.find({ isVerified: true }).populate('user', 'name email phone');
        res.status(200).json({ count: dealers.length, dealers });
    } catch (err) {
        next(err);
    }
};

module.exports = { getPendingDealers, getVerifiedDealers };