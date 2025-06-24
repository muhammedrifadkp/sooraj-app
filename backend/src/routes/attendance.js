const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');
const LiveClass = require('../models/LiveClass');
const Holiday = require('../models/Holiday');

// Get attendance records for the current user
router.get('/my-attendance', protect, async (req, res) => {
  try {
    // Get all live classes for the user's department
    const liveClasses = await LiveClass.find({ 
      department: req.user.department 
    }).select('_id title startTime endTime');
    
    // Get both live class attendance and login attendance records
    const attendanceRecords = await Attendance.find({
      userId: req.user._id
    }).sort({ date: -1 });
    
    // Combine the data
    const attendanceData = attendanceRecords.map(record => {
      const liveClass = liveClasses.find(lc => lc._id.toString() === record.liveClassId?.toString());
      
      return {
        _id: record._id,
        type: record.type,
        status: record.status,
        date: record.date,
        loginTime: record.loginTime,
        liveClassId: record.liveClassId,
        title: liveClass ? liveClass.title : null,
        startTime: liveClass ? liveClass.startTime : null,
        endTime: liveClass ? liveClass.endTime : null
      };
    });
    
    res.json(attendanceData);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get attendance records for all students (admin only)
router.get('/all', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const attendanceRecords = await Attendance.find()
      .populate('userId', 'name email department')
      .populate('liveClassId', 'title startTime endTime department');
    
    res.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching all attendance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark attendance for a live class
router.post('/mark', protect, async (req, res) => {
  try {
    const { liveClassId, status, notes } = req.body;
    
    // Check if live class exists
    const liveClass = await LiveClass.findById(liveClassId);
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }
    
    // Check if user is admin or the instructor of the class
    if (req.user.role !== 'admin' && liveClass.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark attendance' });
    }
    
    // Create or update attendance record
    const attendance = await Attendance.findOneAndUpdate(
      { userId: req.body.userId, liveClassId },
      { 
        status, 
        notes,
        date: liveClass.startTime
      },
      { upsert: true, new: true }
    );
    
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark login attendance for student
router.post('/student/mark-login', protect, async (req, res) => {
  try {
    console.log('Marking login attendance for user:', req.user._id);
    
    // Check if user is a student
    if (req.user.role !== 'student') {
      console.log('User is not a student, cannot mark attendance');
      return res.status(403).json({ message: 'Only students can mark login attendance' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('Checking for holidays and weekends for date:', today);
    
    // Check if today is a holiday
    const isHoliday = await Holiday.findOne({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (isHoliday) {
      console.log('Today is a holiday:', isHoliday.name);
      return res.status(200).json({ 
        message: 'Today is a holiday, no attendance required',
        isHoliday: true
      });
    }

    // Check if today is a weekend
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log('Today is a weekend, no attendance required');
      return res.status(200).json({ 
        message: 'Today is a weekend, no attendance required',
        isWeekend: true
      });
    }

    // Check if user has already marked login attendance for today
    const existingLogin = await Attendance.findOne({
      userId: req.user._id,
      type: 'login',
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingLogin) {
      console.log('Attendance already marked for today:', existingLogin._id);
      return res.status(200).json({ 
        message: 'Login attendance already marked for today',
        attendance: existingLogin
      });
    }

    console.log('Creating new login attendance record');
    // Create login attendance record
    const attendance = await Attendance.create({
      userId: req.user._id,
      type: 'login',
      status: 'present',
      date: new Date(),
      loginTime: new Date()
    });

    console.log('Attendance record created successfully:', attendance._id);
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error marking login attendance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all holidays
router.get('/get-all-holidays', protect, async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get holidays for a specific month
router.get('/get-month-holidays', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Create start and end dates for the month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, parseInt(month) + 1, 0);
    
    const holidays = await Holiday.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });
    
    res.json(holidays);
  } catch (error) {
    console.error('Error fetching month holidays:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 