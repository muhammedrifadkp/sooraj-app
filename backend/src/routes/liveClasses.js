const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const LiveClass = require('../models/LiveClass');

// Get live classes for the current user
router.get('/my-classes', protect, async (req, res) => {
  try {
    console.log('Fetching live classes for user:', req.user._id);
    
    const liveClasses = await LiveClass.find({
      $or: [
        { instructor: req.user._id },
        { participants: req.user._id }
      ]
    })
    .populate('course', 'title')
    .populate('instructor', 'name email')
    .sort({ startTime: -1 });

    console.log(`Found ${liveClasses.length} live classes`);
    res.json(liveClasses);
  } catch (error) {
    console.error('Error fetching live classes:', error);
    res.status(500).json({ message: error.message });
  }
});

// ... existing code ...

module.exports = router; 