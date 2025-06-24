const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  verifyToken, 
  logout, 
  changePassword, 
  registerAdmin,
  forgotPassword,
  resetPassword 
} = require('../controllers/authController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const LoginHistory = require('../models/LoginHistory');

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Verify token
router.get('/verify', protect, verifyToken);

// Logout
router.post('/logout', protect, logout);

// Change password
router.put('/change-password', protect, changePassword);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

// Admin routes
router.post('/register-admin', protect, isAdmin, registerAdmin);

// Get login history for the current user
router.get('/login-history', protect, async (req, res) => {
  try {
    console.log('Fetching login history for user:', req.user._id);
    
    const loginHistory = await LoginHistory.find({ userId: req.user._id })
      .sort({ timestamp: -1 });
    
    console.log(`Found ${loginHistory.length} login records`);
    res.json(loginHistory);
  } catch (error) {
    console.error('Error fetching login history:', error);
    res.status(500).json({ message: error.message });
  }
});

// Record a new login
router.post('/login-history', protect, async (req, res) => {
  try {
    const { deviceInfo, ipAddress } = req.body;
    
    const loginRecord = new LoginHistory({
      userId: req.user._id,
      deviceInfo,
      ipAddress
    });
    
    await loginRecord.save();
    console.log('New login record created:', loginRecord);
    
    res.status(201).json(loginRecord);
  } catch (error) {
    console.error('Error recording login:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 