const express = require('express');
const router = express.Router();

const { register, login, logout, getMe, forgotPassword, verifyOTP, resetPassword, deleteAccount } = require('../controllers/auth-controller');
const { protect } = require('../middleware/auth-middleware');
const { authLimiter } = require('../middleware/security-middleware');

router.post('/register', register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.delete('/account', protect, authLimiter, deleteAccount);

router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/reset-password', authLimiter, resetPassword);

module.exports = router;