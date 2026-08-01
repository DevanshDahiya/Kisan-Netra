const express = require('express');
const router = express.Router();

const {
    getMyInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    logUsage,
    getAlerts,
} = require('../controllers/inventory-controller');

const { protect, authorize } = require('../middleware/auth-middleware');

router.use(protect, authorize('farmer'));  // every route  below requires a logged-in farmer

router.get('/', getMyInventory);
router.post('/', addInventoryItem);
router.get('/alerts', getAlerts); // must come before /:id or Express will treat "alerts" as an :id
router.patch('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);
router.post('/:id/usage', logUsage);

module.exports = router; 