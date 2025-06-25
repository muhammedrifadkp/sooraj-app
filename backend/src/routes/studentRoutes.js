const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const LiveClass = require('../models/LiveClass');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');

// Get student dashboard data
router.get('/dashboard', protect, async (req, res) => {
    try {
        console.log('Fetching dashboard data for student:', req.user._id);
        
        if (!req.user.department) {
            console.error('No department found for user:', req.user._id);
            return res.status(400).json({ message: 'Student department not found' });
        }

        // Get student's courses
        const courses = await Course.find({ 
            department: req.user.department,
            enrolledStudents: req.user._id 
        }).select('title');

        // Get student's assignments
        const assignments = await Assignment.find({
            department: req.user.department,
            'submissions.student': req.user._id
        }).select('title submissions');

        // Get upcoming live classes
        const currentDate = new Date();
        const liveClasses = await LiveClass.find({
            department: req.user.department,
            endTime: { $gt: currentDate },
            status: { $in: ['scheduled', 'ongoing'] }
        })
        .populate('course', 'title')
        .sort({ startTime: 1 })
        .limit(2);

        // Calculate statistics
        const stats = {
            coursesInProgress: courses.length,
            assignmentsCompleted: assignments.length,
            averageScore: assignments.reduce((acc, curr) => {
                const submission = curr.submissions.find(s => s.student.toString() === req.user._id.toString());
                return acc + (submission?.marks || 0);
            }, 0) / (assignments.length || 1),
            attendanceRate: 0 // This will be calculated from live classes
        };

        // Calculate attendance rate from live classes
        const allLiveClasses = await LiveClass.find({
            department: req.user.department,
            endTime: { $lt: currentDate }
        });
        const attendedClasses = allLiveClasses.filter(lc => 
            lc.participants && lc.participants.includes(req.user._id)
        );
        stats.attendanceRate = allLiveClasses.length > 0 
            ? Math.round((attendedClasses.length / allLiveClasses.length) * 100)
            : 0;

        // Format course progress
        const courseProgress = courses.map(course => ({
            id: course._id,
            title: course.title,
            progress: Math.floor(Math.random() * 100), // This should be calculated based on actual progress
            nextLesson: 'Next Lesson' // This should be determined based on course structure
        }));

        // Format upcoming events
        const upcomingEvents = liveClasses.map(lc => ({
            id: lc._id,
            type: 'live-class',
            title: `Live Class: ${lc.course.title}`,
            time: lc.startTime,
            duration: lc.duration
        }));

        res.json({
            stats,
            courseProgress,
            upcomingEvents
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get upcoming and ongoing live classes for student's department
router.get('/live-classes', protect, async (req, res) => {
    try {
        console.log('Fetching live classes for student department:', req.user.department);
        
        if (!req.user.department) {
            console.error('No department found for user:', req.user._id);
            return res.status(400).json({ message: 'Student department not found' });
        }

        const currentDate = new Date();
        
        // Find live classes that:
        // 1. Match the student's department
        // 2. Either:
        //    - Haven't started yet (upcoming)
        //    - Are currently ongoing (endTime hasn't passed)
        const liveClasses = await LiveClass.find({
            department: req.user.department,
            endTime: { $gt: currentDate }, // End time is in the future
            status: { $in: ['scheduled', 'ongoing'] } // Only get scheduled or ongoing classes
        })
        .populate('course', 'title')
        .populate('instructor', 'name email')
        .sort({ startTime: 1 }); // Sort by start time in ascending order (earliest first)

        console.log(`Found ${liveClasses.length} upcoming/ongoing live classes for department ${req.user.department}`);
        
        // Map the live classes to include a status indicator
        const mappedLiveClasses = liveClasses.map(liveClass => {
            const isOngoing = currentDate >= new Date(liveClass.startTime) && currentDate <= new Date(liveClass.endTime);
            return {
                ...liveClass.toObject(),
                currentStatus: isOngoing ? 'ongoing' : 'upcoming'
            };
        });

        res.json(mappedLiveClasses);
    } catch (error) {
        console.error('Error fetching live classes:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 