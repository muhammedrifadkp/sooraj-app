// API endpoint to increase or decrease present days for a student
// POST /api/attendance/admin/update-present
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');
const LiveClass = require('../models/LiveClass');

// Admin can update present days for a student
router.post('/admin/update-present', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { userId, liveClassId, action } = req.body;
    // action: 'increase' or 'decrease'
    if (!userId || !liveClassId || !['increase', 'decrease'].includes(action)) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }
    // Find attendance record
    let attendance = await Attendance.findOne({ userId, liveClassId });
    if (action === 'increase') {
      if (!attendance) {
        // Mark as present
        const liveClass = await LiveClass.findById(liveClassId);
        if (!liveClass) return res.status(404).json({ message: 'Live class not found' });
        attendance = await Attendance.create({
          userId,
          liveClassId,
          status: 'present',
          date: liveClass.startTime
        });
      } else {
        attendance.status = 'present';
        await attendance.save();
      }
    } else if (action === 'decrease') {
      if (attendance && attendance.status === 'present') {
        attendance.status = 'absent';
        await attendance.save();
      }
    }
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error updating present days:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
