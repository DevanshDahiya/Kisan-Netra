const express = require('express');
const router = express.Router();

const {
    createDealer,
    getDealer,
    getMyDealerProfile,
    updateDealer,
    deleteDealer,
    getNearbyDealers,
    verifyDealer,
} = require('../controllers/dealer-controller');

const { getDealerStock, addStock, updateStock, deleteStock } = require('../controllers/dealerStock-controller');


const { protect, authorize } = require('../middleware/auth-middleware');

router.post('/', protect, authorize('dealer'), createDealer);
router.get('/me', protect, authorize('dealer'), getMyDealerProfile);

// /nearby must come before /:id  , otherwise Express treats "nearby" as the :id parameter itself 

router.get('/nearby', getNearbyDealers);

router.get('/:id', getDealer);
router.patch('/:id', protect, authorize('dealer'), updateDealer);
router.patch('/:id/verify', protect, authorize('admin'), verifyDealer);
router.delete('/:id', protect, authorize('dealer', 'admin'), deleteDealer);

// Nested stock routes 
router.get('/:id/stock', getDealerStock);
router.post('/:id/stock', protect, authorize('dealer'), addStock);
router.patch('/:id/stock/:stockId', protect, authorize('dealer'), updateStock);
router.delete('/:id/stock/:stockId', protect, authorize('dealer'), deleteStock);


module.exports = router; 