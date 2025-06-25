const express = require('express');
const router = express.Router();
const { protect, isAdmin, isInstructor } = require('../middleware/authMiddleware');
const GradedResult = require('../models/GradedResult');
const Assignment = require('../models/Assignment');
const Certificate = require('../models/Certificate');

// Test route to verify router is working
router.get('/test', (req, res) => {
  console.log('Graded results test route accessed');
  console.log('Request headers:', req.headers);
  
  // Return information about the request
  res.json({ 
    message: 'Graded results router is working',
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: {
        contentType: req.headers['content-type'],
        authorization: req.headers.authorization ? 'Present' : 'Not present'
      }
    },
    server: {
      timestamp: new Date().toISOString(),
      nodejs: process.version
    }
  });
});

// Get all graded results (admin only)
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    let gradedResults = await GradedResult.find()
      .populate('assignment', 'title totalMarks')
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ gradedAt: -1 });

    // Filter out results where the assignment no longer exists
    gradedResults = gradedResults.filter(result => result.assignment !== null);
    
    res.json(gradedResults);
  } catch (error) {
    console.error('Error fetching graded results:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get detailed graded result for an assignment (for a student)
router.get('/assignment/:assignmentId', protect, async (req, res) => {
  try {
    const gradedResult = await GradedResult.findOne({
      assignment: req.params.assignmentId,
      student: req.user._id
    })
      .populate('assignment', 'title totalMarks')
      .populate('course', 'title');
    
    if (!gradedResult) {
      return res.status(404).json({ 
        message: 'Graded result not found. You might not have submitted this assignment yet.' 
      });
    }
    
    res.json(gradedResult);
  } catch (error) {
    console.error('Error fetching graded result:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all graded results for current student
router.get('/student/my-results', protect, async (req, res) => {
  try {
    console.log('=====================================');
    console.log('Accessing /student/my-results endpoint');
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    console.log('Route path:', '/student/my-results');
    console.log('User from token:', req.user);
    console.log('=====================================');
    
    if (!req.user || !req.user._id) {
      console.error('Invalid user object in request');
      return res.status(401).json({ 
        message: 'User authentication failed - no valid user ID found' 
      });
    }
    
    let gradedResults = await GradedResult.find({
      student: req.user._id
    })
      .populate('assignment', 'title totalMarks')
      .populate('course', 'title')
      .sort({ gradedAt: -1 });

    // Filter out results where the assignment no longer exists
    gradedResults = gradedResults.filter(result => result.assignment !== null);
    
    console.log(`Found ${gradedResults.length} graded results for user ${req.user._id}`);
    res.json(gradedResults);
  } catch (error) {
    console.error('Error fetching student graded results:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all graded results for a specific course (instructor only)
router.get('/course/:courseId', protect, isInstructor, async (req, res) => {
  try {
    let gradedResults = await GradedResult.find({
      course: req.params.courseId
    })
      .populate('assignment', 'title totalMarks')
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ gradedAt: -1 });

    // Filter out results where the assignment no longer exists
    gradedResults = gradedResults.filter(result => result.assignment !== null);
    
    res.json(gradedResults);
  } catch (error) {
    console.error('Error fetching course graded results:', error);
    res.status(500).json({ message: error.message });
  }
});

// Debug route - Get all graded results without authentication (TEMPORARY, FOR DEBUGGING ONLY)
router.get('/debug/my-results', async (req, res) => {
  try {
    console.log('Accessing DEBUG /debug/my-results endpoint');
    
    // Return mock data for testing
    const mockResults = [
      {
        _id: 'debug-result-1',
        assignment: {
          _id: 'debug-assignment-1',
          title: 'Debug Assignment 1',
          totalMarks: 100
        },
        course: {
          _id: 'debug-course-1',
          title: 'Debug Course'
        },
        submittedAt: new Date().toISOString(),
        gradedAt: new Date().toISOString(),
        earnedMarks: 85,
        totalMarks: 100,
        percentage: 85,
        scaledScore: 85,
        status: 'evaluated',
        certificateIssued: true,
        certificateId: 'debug-cert-1',
        overallFeedback: 'This is debug feedback'
      }
    ];
    
    console.log('Returning mock results for debugging');
    res.json(mockResults);
  } catch (error) {
    console.error('Error in debug route:', error);
    res.status(500).json({ message: error.message });
  }
});

// IMPORTANT: Specific routes must be defined BEFORE parameter routes to avoid conflicts
// Get detailed graded result by ID - THIS WAS PREVIOUSLY CATCHING /student/my-results REQUESTS
router.get('/:id', protect, async (req, res) => {
  try {
    console.log('=====================================');
    console.log('Accessing /:id endpoint');
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    console.log('Route path: /:id');
    console.log('ID parameter:', req.params.id);
    console.log('=====================================');
    
    // Skip processing for common non-ID paths that should be handled by other routes
    if (req.params.id === 'student' || req.params.id === 'debug' || req.params.id === 'assignment' || req.params.id === 'course') {
      console.log(`WARNING: /:id route caught a request for /${req.params.id} that should be handled by a more specific route!`);
      console.log('This likely indicates a router configuration issue.');
      return res.status(404).json({ 
        message: `Not found. The route /${req.params.id} was incorrectly matched to the /:id route.`,
        routingError: true 
      });
    }
    
    const gradedResult = await GradedResult.findById(req.params.id)
      .populate('assignment', 'title totalMarks instructions questions')
      .populate('student', 'name email')
      .populate('course', 'title');
    
    if (!gradedResult) {
      return res.status(404).json({ message: 'Graded result not found' });
    }
    
    // Only allow access to admins, instructors, or the student who owns the result
    if (
      req.user.role !== 'admin' && 
      req.user.role !== 'instructor' && 
      gradedResult.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to access this graded result' });
    }
    
    res.json(gradedResult);
  } catch (error) {
    console.error('Error fetching graded result:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update a graded result (instructor only)
router.put('/:id', protect, isInstructor, async (req, res) => {
  try {
    const gradedResult = await GradedResult.findById(req.params.id);
    
    if (!gradedResult) {
      return res.status(404).json({ message: 'Graded result not found' });
    }
    
    const { answers, overallFeedback, comments, status } = req.body;
    
    // Calculate new totals if answers were updated
    if (answers && Array.isArray(answers)) {
      let earnedMarks = 0;
      let totalMarks = 0;
      
      answers.forEach(answer => {
        totalMarks += answer.maxMarks;
        earnedMarks += answer.marks || 0;
      });
      
      const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
      
      // Get the assignment to calculate scaled score
      const assignment = await Assignment.findById(gradedResult.assignment);
      const scaledScore = Math.round((percentage / 100) * assignment.totalMarks);
      
      // Update graded result
      gradedResult.answers = answers;
      gradedResult.earnedMarks = earnedMarks;
      gradedResult.totalMarks = totalMarks;
      gradedResult.percentage = percentage;
      gradedResult.scaledScore = scaledScore;
      gradedResult.gradedAt = new Date();
      gradedResult.gradedBy = req.user._id;
    }
    
    // Update feedback and comments
    if (overallFeedback) gradedResult.overallFeedback = overallFeedback;
    if (comments) gradedResult.comments = comments;
    if (status) gradedResult.status = status;
    
    const updatedResult = await gradedResult.save();
    
    // If score is now passing, create certificate if it doesn't exist
    if (updatedResult.percentage >= 60 && !updatedResult.certificateIssued) {
      try {
        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({
          student: updatedResult.student,
          assignment: updatedResult.assignment
        });
        
        if (!existingCertificate) {
          const assignment = await Assignment.findById(updatedResult.assignment)
            .populate('course', 'instructor');
            
          const certificate = new Certificate({
            student: updatedResult.student,
            course: updatedResult.course,
            assignment: updatedResult.assignment,
            instructor: assignment.course.instructor,
            grade: updatedResult.scaledScore.toString(),
            completionDate: new Date(),
            status: 'issued',
            signature: 'Auto-generated'
          });
          
          const savedCertificate = await certificate.save();
          
          // Update graded result with certificate info
          updatedResult.certificateIssued = true;
          updatedResult.certificateId = savedCertificate._id;
          await updatedResult.save();
        }
      } catch (certError) {
        console.error('Error generating certificate:', certError);
        // Don't fail the update if certificate generation fails
      }
    }
    
    res.json(updatedResult);
  } catch (error) {
    console.error('Error updating graded result:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 