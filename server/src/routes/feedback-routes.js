const express = require('express');
const router = express.Router();

const { createFeedback, getAllFeedback, updateFeedbackStatus } = require('../controllers/feedback-controller');
const { protect, authorize } = require('../middleware/auth-middleware');

router.post('/', protect, createFeedback);
router.get('/', protect, authorize('admin'), getAllFeedback);
router.patch('/:id/status', protect, authorize('admin'), updateFeedbackStatus);

module.exports = router;
