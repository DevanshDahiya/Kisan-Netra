const express = require('express');
const router = express.Router();
const { getPendingDealers, getVerifiedDealers } = require('../controllers/admin-controller');

const { protect, authorize } = require('../middleware/auth-middleware');

router.use(protect, authorize('admin'));


router.get('/dealers/pending', getPendingDealers);
router.get('/dealers/verified', getVerifiedDealers);

module.exports = router;