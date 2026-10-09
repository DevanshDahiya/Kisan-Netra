const Dealer = require('../models/Dealer');
const LicensedDealer = require('../models/LicensedDealer');
const { normalizeLicense } = require('../utils/license-normalizer');

// @route GET /api/admin/dealers/pending
const getPendingDealers = async (req, res, next) => {
    try {
        const dealers = await Dealer.find({ isVerified: false }).populate('user', 'name email phone');

        const enrichedDealers = await Promise.all(
            dealers.map(async (dealer) => {
                const doc = dealer.toObject();
                const normalized = normalizeLicense(dealer.licenseNumber);
                const registryEntry = normalized ? await LicensedDealer.findOne({ licenseNumber: normalized }) : null;

                const userEmail = dealer.user?.email ? dealer.user.email.toLowerCase().trim() : '';
                const emailMatchesRegistry = Boolean(registryEntry && registryEntry.emails && registryEntry.emails.includes(userEmail));

                return {
                    ...doc,
                    registryHint: {
                        licenseFoundInRegistry: Boolean(registryEntry),
                        emailMatchesRegistry,
                    },
                };
            })
        );

        res.status(200).json({ count: enrichedDealers.length, dealers: enrichedDealers });
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