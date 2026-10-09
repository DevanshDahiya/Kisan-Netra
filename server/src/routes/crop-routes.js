const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth-middleware');
const {
    getMyCrops,
    getCropById,
    createCrop,
    updateCrop,
    addCropActivity,
    deleteCrop,
} = require('../controllers/crop-controller');

// All crop routes require farmer authorization
router.use(protect);
router.use(authorize('farmer'));

router.get('/', getMyCrops);
router.post('/', createCrop);
router.get('/:id', getCropById);
router.put('/:id', updateCrop);
router.post('/:id/activities', addCropActivity);
router.delete('/:id', deleteCrop);

module.exports = router;
