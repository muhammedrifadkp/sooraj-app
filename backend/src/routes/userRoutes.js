const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const validator = require('validator');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Upload profile photo
router.post('/upload-photo', protect, async (req, res) => {
  try {
    console.log('Upload photo request received:', {
      body: req.body,
      user: req.user,
      headers: req.headers
    });
    
    if (!req.body.photo) {
      console.log('No photo data provided');
      return res.status(400).json({ 
        success: false,
        message: 'No photo data provided' 
      });
    }

    // Convert base64 to buffer
    const base64Data = req.body.photo.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Update user's avatar in database
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    console.log('Updating user avatar for:', user.email);
    try {
      // Store image data directly in MongoDB
      user.avatar = {
        data: buffer,
        contentType: req.body.contentType || 'image/jpeg'
      };
      await user.save();
      console.log('Photo uploaded successfully for user:', user.email);
      
      // Return success response
      res.json({ 
        success: true,
        message: 'Photo uploaded successfully'
      });
    } catch (saveError) {
      console.error('Error saving user avatar:', saveError);
      throw saveError;
    }
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload photo',
      error: error.message 
    });
  }
});

// Get user profile with avatar
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert avatar buffer to base64
    const userData = user.toObject();
    if (userData.avatar && userData.avatar.data) {
      userData.avatar = {
        data: userData.avatar.data.toString('base64'),
        contentType: userData.avatar.contentType
      };
    }

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    console.log('Update profile request received:', {
      body: req.body,
      user: req.user,
      headers: req.headers
    });

    const { name, email, bio, location, role } = req.body;

    // Validate required fields
    if (!name || !email) {
      console.log('Missing required fields:', { name, email });
      return res.status(400).json({ 
        success: false,
        message: 'Name and email are required fields'
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Find user
    console.log('Finding user with ID:', req.user.id);
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      console.log('Checking if email is taken:', email);
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        console.log('Email already taken by user:', existingUser._id);
        return res.status(400).json({ 
          success: false,
          message: 'Email is already taken' 
        });
      }
    }

    try {
      // Update fields
      user.name = name;
      user.email = email;
      if (bio !== undefined) user.bio = bio;
      if (location !== undefined) user.location = location;
      // Ensure role is lowercase if provided
      if (role) {
        user.role = role.toLowerCase();
      }

      // Save the user
      console.log('Attempting to save user with data:', {
        name: user.name,
        email: user.email,
        bio: user.bio,
        location: user.location,
        role: user.role
      });

      const updatedUser = await user.save();
      console.log('User saved successfully:', updatedUser);

      // Convert to plain object and remove password
      const userResponse = updatedUser.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        user: userResponse
      });
    } catch (updateError) {
      console.error('Detailed update error:', {
        name: updateError.name,
        message: updateError.message,
        stack: updateError.stack,
        errors: updateError.errors
      });
      throw updateError;
    }
  } catch (error) {
    console.error('Error updating profile:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      errors: error.errors
    });
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile',
      error: error.message,
      details: error.errors
    });
  }
});

module.exports = router; 