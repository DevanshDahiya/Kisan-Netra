const Dealer = require('../models/Dealer');
const DealerStock = require('../models/DealerStock');
const LicensedDealer = require('../models/LicensedDealer');
const User = require('../models/User');
const { getTodayDateString } = require('../utils/storeStatus');
const { rankDealers } = require('../utils/rank-dealers');
const { generateOTP, hashOTP, compareOTP } = require('../utils/Otp');
const { sendRegistryClaimEmail } = require('../utils/EmailService');
const { normalizeLicense } = require('../utils/license-normalizer');

// @route GET /api/dealers/registry/match
const checkRegistryMatch = async (req, res, next) => {
    try {
        const userEmail = req.user.email.toLowerCase().trim();
        const existingProfile = await Dealer.findOne({ user: req.user._id });
        const matchedRecord = await LicensedDealer.findOne({ emails: userEmail });

        res.status(200).json({
            matched: Boolean(matchedRecord),
            alreadyHasProfile: Boolean(existingProfile),
            isVerified: Boolean(existingProfile?.isVerified),
        });
    } catch (err) {
        next(err);
    }
};

// @route POST /api/dealers/registry/send-otp
const sendRegistryOTP = async (req, res, next) => {
    try {
        const existingProfile = await Dealer.findOne({ user: req.user._id });
        if (existingProfile && existingProfile.isVerified) {
            return res.status(400).json({ message: 'Store profile is already verified.' });
        }

        const userEmail = req.user.email.toLowerCase().trim();
        const matchedRecord = await LicensedDealer.findOne({ emails: userEmail });
        if (!matchedRecord) {
            return res.status(404).json({ message: 'No licensed dealer record found for your email address.' });
        }

        const user = await User.findById(req.user._id).select('+registryClaimSentAt +registryClaimOTP +registryClaimExpires +registryClaimAttempts');
        if (user.registryClaimSentAt && Date.now() - user.registryClaimSentAt.getTime() < 60000) {
            const secondsLeft = Math.ceil((60000 - (Date.now() - user.registryClaimSentAt.getTime())) / 1000);
            return res.status(429).json({ message: `Please wait ${secondsLeft} seconds before requesting a new code.` });
        }

        const otp = generateOTP();
        user.registryClaimOTP = await hashOTP(otp);
        user.registryClaimExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.registryClaimAttempts = 0;
        user.registryClaimSentAt = new Date();
        await user.save();

        await sendRegistryClaimEmail(user.email, otp);

        res.status(200).json({ message: 'Verification code sent to your registered email.' });
    } catch (err) {
        next(err);
    }
};

// @route POST /api/dealers/registry/verify-otp
const verifyRegistryOTP = async (req, res, next) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({ message: 'OTP is required.' });
        }

        const user = await User.findById(req.user._id).select(
            '+registryClaimOTP +registryClaimExpires +registryClaimAttempts +registryClaimVerifiedAt'
        );

        if (!user || !user.registryClaimOTP) {
            return res.status(400).json({ message: 'No verification code request found. Please request a new code.' });
        }

        if (user.registryClaimAttempts >= 5) {
            return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new code.' });
        }

        if (user.registryClaimExpires < Date.now()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }

        const isMatch = await compareOTP(otp, user.registryClaimOTP);
        if (!isMatch) {
            user.registryClaimAttempts += 1;
            await user.save();
            return res.status(400).json({ message: 'Incorrect verification code.' });
        }

        user.registryClaimVerifiedAt = new Date();
        user.registryClaimOTP = undefined;
        user.registryClaimExpires = undefined;
        user.registryClaimAttempts = 0;
        await user.save();

        const userEmail = user.email.toLowerCase().trim();
        const record = await LicensedDealer.findOne({ emails: userEmail });
        if (!record) {
            return res.status(404).json({ message: 'Licensed record not found.' });
        }

        const prefill = {
            businessName: record.businessName || '',
            licenseNumber: record.licenseNumber || '',
            address: record.address || '',
            district: record.district || '',
            phone: (record.phones && record.phones[0]) || '',
            ownerName: record.ownerName || '',
        };

        res.status(200).json({
            message: 'Email verified successfully with licensed registry.',
            prefill,
        });
    } catch (err) {
        next(err);
    }
};

// @route GET /api/dealers/nearby?lng=&lat=&productId=&radius=&sort=
// Find dealers near a location, optionally filtered by product and smart-ranked by price/distance
const getNearbyDealers = async (req, res, next) => {
    try {
        const { lng, lat, productId, radius, sort } = req.query;

        if (!lng || !lat) {
            return res.status(400).json({ message: 'lng and lat query parameters are required.' });
        }

        const maxDistanceMeters = radius ? Number(radius) * 1000 : 20000; // default 20km

        let dealerIdFilter = null;
        let stockByDealer = {}; // dealerId -> stockInfo, used to enrich results below
        if (productId) {
            const stockEntries = await DealerStock.find({
                product: productId,
                quantityAvailable: { $gt: 0 },
            }).select('dealer quantityAvailable unit price priceUpdatedAt');
            dealerIdFilter = stockEntries.map((s) => s.dealer);
            stockEntries.forEach((s) => {
                stockByDealer[s.dealer.toString()] = {
                    quantityAvailable: s.quantityAvailable,
                    unit: s.unit,
                    price: s.price !== undefined ? s.price : null,
                    priceUpdatedAt: s.priceUpdatedAt || null,
                };
            });
        }

        // $geoNear must be the first stage in the pipeline, and it requires the
        // 2dsphere index.
        const openOnlyFilter = req.query.openOnly === 'true' ? { isOpenToday: true, lastOpenedDate: getTodayDateString() } : {};

        const pipeline = [
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
                    distanceField: 'distance',
                    maxDistance: maxDistanceMeters,
                    spherical: true,
                    query: {
                        isVerified: true,
                        ...openOnlyFilter,
                        ...(dealerIdFilter ? { _id: { $in: dealerIdFilter } } : {}),
                    },
                },
            },
            { $limit: 50 },
        ];

        const dealers = await Dealer.aggregate(pipeline);

        const todayDate = getTodayDateString();
        // Attach stock quantity and compute real-time isOpenToday boolean flag
        const enrichedDealers = dealers.map((d) => {
            const isStoreCurrentlyOpen = Boolean(d.isOpenToday && d.lastOpenedDate === todayDate);
            return {
                ...d,
                isOpenToday: isStoreCurrentlyOpen,
                stockInfo: stockByDealer[d._id.toString()] || null,
            };
        });

        const rankedResult = rankDealers(enrichedDealers, {
            sort: sort || 'best',
            productId: productId || null,
            limit: 20,
        });

        res.status(200).json(rankedResult);
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

        const user = await User.findById(req.user._id).select('+registryClaimVerifiedAt');
        const userEmail = req.user.email.toLowerCase().trim();
        const registryRecord = await LicensedDealer.findOne({ emails: userEmail });

        let isVerified = false;
        let verificationSource = null;
        let verifiedAt = null;
        let assignedLicenseNumber = licenseNumber;
        let assignedRegistryRecord = null;
        let verificationType = 'pending_admin';
        let customMessage = null;

        const isClaimRecent = user?.registryClaimVerifiedAt && (Date.now() - user.registryClaimVerifiedAt.getTime() <= 30 * 60 * 1000);
        const isLicenseValid = registryRecord && (!registryRecord.licenseValidUntil || new Date(registryRecord.licenseValidUntil) >= new Date());

        if (registryRecord && isClaimRecent && isLicenseValid) {
            isVerified = true;
            verificationSource = 'registry';
            verifiedAt = new Date();
            assignedLicenseNumber = registryRecord.licenseNumber;
            assignedRegistryRecord = registryRecord._id;
            verificationType = 'registry';

            // Single use: clear registryClaimVerifiedAt
            user.registryClaimVerifiedAt = undefined;
            await user.save();
        } else if (registryRecord && isClaimRecent && !isLicenseValid) {
            customMessage = 'Your registry licence is expired; an admin will review your store.';
        }

        const dealer = await Dealer.create({
            user: req.user._id,
            storeName,
            address,
            licenseNumber: assignedLicenseNumber,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude], // order matters: [lng, lat]
            },
            contactPhone,
            isVerified,
            verificationSource,
            verifiedAt,
            registryRecord: assignedRegistryRecord,
        });

        res.status(201).json({
            dealer,
            verification: verificationType,
            message: customMessage || (isVerified ? 'Store verified via licensed dealer registry.' : 'Store profile submitted for admin verification.'),
        });
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

        // Ownership check
        if (dealer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only update your own store profile.' });
        }

        const { storeName, address, licenseNumber, longitude, latitude, contactPhone } = req.body;

        const user = await User.findById(req.user._id).select('+registryClaimVerifiedAt');
        const userEmail = req.user.email.toLowerCase().trim();
        const registryRecord = await LicensedDealer.findOne({ emails: userEmail });

        const isClaimRecent = user?.registryClaimVerifiedAt && (Date.now() - user.registryClaimVerifiedAt.getTime() <= 30 * 60 * 1000);
        const isLicenseValid = registryRecord && (!registryRecord.licenseValidUntil || new Date(registryRecord.licenseValidUntil) >= new Date());

        let verificationType = null;
        if (!dealer.isVerified && registryRecord && isClaimRecent && isLicenseValid) {
            dealer.isVerified = true;
            dealer.verificationSource = 'registry';
            dealer.verifiedAt = new Date();
            dealer.licenseNumber = registryRecord.licenseNumber;
            dealer.registryRecord = registryRecord._id;
            verificationType = 'registry';

            user.registryClaimVerifiedAt = undefined;
            await user.save();
        } else if (licenseNumber !== undefined && licenseNumber !== dealer.licenseNumber) {
            if (dealer.verificationSource === 'registry') {
                return res.status(400).json({ message: 'Registry-verified license number cannot be changed.' });
            }
            // If admin-verified dealer changes license, set back to pending
            dealer.licenseNumber = licenseNumber;
            dealer.isVerified = false;
            dealer.verificationSource = null;
            dealer.verifiedAt = null;
            dealer.registryRecord = null;
        }

        if (storeName) dealer.storeName = storeName;
        if (address) dealer.address = address;
        if (contactPhone) dealer.contactPhone = contactPhone;
        if (longitude !== undefined && latitude !== undefined) {
            dealer.location.coordinates = [longitude, latitude];
        }

        await dealer.save();
        res.status(200).json({ dealer, verification: verificationType });
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
            {
                isVerified: true,
                verificationSource: 'admin',
                verifiedAt: new Date(),
            },
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

// @route PATCH /api/dealers/:id/open-today - dealer only
const openStoreToday = async (req, res, next) => {
    try {
        const dealer = await Dealer.findById(req.params.id);
        if (!dealer) {
            return res.status(404).json({ message: 'Dealer not found.' });
        }

        if (dealer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only update your own store status.' });
        }

        dealer.isOpenToday = true;
        dealer.lastOpenedDate = getTodayDateString();
        await dealer.save();

        res.status(200).json({ dealer, message: 'Store marked as open for today.' });
    } catch (err) {
        next(err);
    }
};

// @route PATCH /api/dealers/:id/close-today - dealer only
const closeStoreToday = async (req, res, next) => {
    try {
        const dealer = await Dealer.findById(req.params.id);
        if (!dealer) {
            return res.status(404).json({ message: 'Dealer not found.' });
        }

        if (dealer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only update your own store status.' });
        }

        dealer.isOpenToday = false;
        await dealer.save();

        res.status(200).json({ dealer, message: 'Store marked as closed for today.' });
    } catch (err) {
        next(err);
    }
};

// @route PATCH /api/dealers/:id/unverify - admin only
const unverifyDealer = async (req, res, next) => {
    try {
        const dealer = await Dealer.findByIdAndUpdate(
            req.params.id,
            {
                isVerified: false,
                verificationSource: null,
                verifiedAt: null,
            },
            { new: true }
        );
        if (!dealer) {
            return res.status(404).json({ message: 'Dealer not found.' });
        }
        res.status(200).json({ dealer, message: 'Dealer verification revoked.' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    checkRegistryMatch,
    sendRegistryOTP,
    verifyRegistryOTP,
    createDealer,
    getDealer,
    getMyDealerProfile,
    updateDealer,
    deleteDealer,
    getNearbyDealers,
    verifyDealer,
    unverifyDealer,
    openStoreToday,
    closeStoreToday,
};