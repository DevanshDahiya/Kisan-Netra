const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth-middleware');
const {
    getMyFarms,
    getFarmById,
    createFarm,
    updateFarm,
    deleteFarm,
} = require('../controllers/farm-controller');

// All farm endpoints require farmer authentication
router.use(protect);
router.use(authorize('farmer'));

router.get('/', getMyFarms);
router.post('/', createFarm);
router.get('/:id', getFarmById);
router.put('/:id', updateFarm);
router.delete('/:id', deleteFarm);

module.exports = router;
