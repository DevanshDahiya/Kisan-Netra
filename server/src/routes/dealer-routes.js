const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/dealer-controller');

const { getDealerStock, addStock, updateStock, deleteStock, getDealerAnalytics } = require('../controllers/dealerStock-controller');

const { protect, authorize } = require('../middleware/auth-middleware');
const { authLimiter } = require('../middleware/security-middleware');

router.post('/', protect, authorize('dealer'), createDealer);
router.get('/me', protect, authorize('dealer'), getMyDealerProfile);
router.get('/analytics', protect, authorize('dealer'), getDealerAnalytics);

// Registry match & claim OTP endpoints (dealer role only)
router.get('/registry/match', protect, authorize('dealer'), checkRegistryMatch);
router.post('/registry/send-otp', protect, authorize('dealer'), authLimiter, sendRegistryOTP);
router.post('/registry/verify-otp', protect, authorize('dealer'), authLimiter, verifyRegistryOTP);

// /nearby must come before /:id  , otherwise Express treats "nearby" as the :id parameter itself 
router.get('/nearby', getNearbyDealers);

router.get('/:id', getDealer);
router.patch('/:id/open-today', protect, authorize('dealer'), openStoreToday);
router.patch('/:id/close-today', protect, authorize('dealer'), closeStoreToday);
router.patch('/:id', protect, authorize('dealer'), updateDealer);
router.patch('/:id/verify', protect, authorize('admin'), verifyDealer);
router.patch('/:id/unverify', protect, authorize('admin'), unverifyDealer);
router.delete('/:id', protect, authorize('dealer', 'admin'), deleteDealer);

// Nested stock routes 
router.get('/:id/stock', getDealerStock);
router.post('/:id/stock', protect, authorize('dealer'), addStock);
router.patch('/:id/stock/:stockId', protect, authorize('dealer'), updateStock);
router.delete('/:id/stock/:stockId', protect, authorize('dealer'), deleteStock);


module.exports = router; 