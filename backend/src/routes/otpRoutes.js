const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

// Send OTP for registration
router.post('/send-registration-otp', otpController.sendRegistrationOTP);

// Verify OTP
router.post('/verify-otp', otpController.verifyOTP);

module.exports = router;
