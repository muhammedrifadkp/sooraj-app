const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Course = require('../models/Course');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const GradedResult = require('../models/GradedResult');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      // Allow only image files for thumbnails
      const allowedTypes = ['.jpg', '.jpeg', '.png'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        const error = new Error(`Invalid file type for thumbnail. Allowed types: ${allowedTypes.join(', ')}`);
        error.code = 'INVALID_FILE_TYPE';
        cb(error);
      }
    } else {
      // Allow all other file types for materials
      const allowedTypes = [
        '.pdf', '.doc', '.docx', 
        '.ppt', '.pptx', '.txt',
        '.xls', '.xlsx',           // Excel files
        '.zip', '.rar',            // Compressed files
        '.jpg', '.jpeg', '.png',   // Images
        '.mp4', '.avi', '.mov'     // Videos
      ];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        const error = new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        error.code = 'INVALID_FILE_TYPE';
        cb(error);
      }
    }
  }
});

// Get all courses
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all courses...'); // Debug log
    const courses = await Course.find()
      .populate('instructor', 'name email');
    console.log('Found courses:', courses); // Debug log
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error); // Debug log
    res.status(500).json({ message: error.message });
  }
});

// Get enrolled courses for current user
router.get('/enrolled', protect, async (req, res) => {
  try {
    console.log('Enrolled endpoint - Starting request');
    console.log('Enrolled endpoint - User ID:', req.user._id);
    console.log('Enrolled endpoint - User:', req.user);

    if (!req.user._id) {
      console.log('Enrolled endpoint - No user ID found');
      return res.status(400).json({ message: 'User ID is required' });
    }

    // First check if user exists
    console.log('Enrolled endpoint - Checking user in database');
    const user = await User.findById(req.user._id).select('_id name email department');
    if (!user) {
      console.log('Enrolled endpoint - User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Enrolled endpoint - User found:', user);

    // Find courses in user's department
    console.log('Enrolled endpoint - Querying courses for department:', req.user.department);
    const courses = await Course.find({
      department: req.user.department
    })
    .populate({
      path: 'instructor',
      select: 'name email',
      model: 'User'
    })
    .select('title description department duration youtubeLink instructor')
    .lean();

    console.log('Enrolled endpoint - Found courses:', courses.length);
    console.log('Enrolled endpoint - Courses:', JSON.stringify(courses, null, 2));

    // Transform the courses to include only necessary data
    const transformedCourses = courses.map(course => {
      try {
        // Ensure instructor exists
        const instructor = course.instructor || { name: 'Unknown', email: '' };
        
        return {
          _id: course._id,
          title: course.title || '',
          description: course.description || '',
          department: course.department || 'CSE',
          duration: course.duration || '',
          youtubeLink: course.youtubeLink || '',
          instructor: {
            _id: instructor._id || '',
            name: instructor.name || 'Unknown',
            email: instructor.email || ''
          }
        };
      } catch (error) {
        console.error('Error transforming course:', course._id, error);
        return null;
      }
    }).filter(course => course !== null);

    console.log('Enrolled endpoint - Transformed courses:', transformedCourses.length);
    console.log('Enrolled endpoint - Transformed courses:', JSON.stringify(transformedCourses, null, 2));

    res.json(transformedCourses);
  } catch (error) {
    console.error('Enrolled endpoint - Error:', error);
    console.error('Enrolled endpoint - Error stack:', error.stack);
    console.error('Enrolled endpoint - Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Send a more detailed error response in development
    if (process.env.NODE_ENV === 'development') {
      res.status(500).json({ 
        message: 'Error fetching enrolled courses',
        error: error.message,
        stack: error.stack,
        details: {
          name: error.name,
          code: error.code
        }
      });
    } else {
      res.status(500).json({ 
        message: 'Error fetching enrolled courses',
        error: 'Internal server error'
      });
    }
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    // Check if the ID is "enrolled" to prevent confusion with the /enrolled route
    if (req.params.id === 'enrolled') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create course (protected route)
router.post('/', protect, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'materialFiles', maxCount: 5 }
]), async (req, res) => {
  try {
    console.log('Creating new course...');
    console.log('Request body:', req.body);
    console.log('Files:', req.files);

    // Parse modules from JSON string
    let modules = [];
    if (req.body.modules) {
      try {
        modules = JSON.parse(req.body.modules);
        console.log('Parsed modules:', modules);
      } catch (error) {
        console.error('Error parsing modules:', error);
        return res.status(400).json({ message: 'Invalid modules format' });
      }
    }

    // Parse materials from JSON string
    let materials = [];
    if (req.body.materials) {
      try {
        materials = JSON.parse(req.body.materials);
        console.log('Parsed materials:', materials);
      } catch (error) {
        console.error('Error parsing materials:', error);
        return res.status(400).json({ message: 'Invalid materials format' });
      }
    }

    // Process uploaded files
    if (req.files && req.files.materialFiles && req.files.materialFiles.length > 0) {
      console.log('Processing uploaded files...');
      const materialTitles = Array.isArray(req.body.materialTitles) 
        ? req.body.materialTitles 
        : [req.body.materialTitles];
      
      const materialDescriptions = Array.isArray(req.body.materialDescriptions) 
        ? req.body.materialDescriptions 
        : [req.body.materialDescriptions];

      // Add uploaded files to materials
      req.files.materialFiles.forEach((file, index) => {
        console.log(`Processing file ${index + 1}:`, file.originalname);
        materials.push({
          title: materialTitles[index] || file.originalname,
          description: materialDescriptions[index] || '',
          fileData: {
            data: file.buffer,
            contentType: file.mimetype
          },
          type: 'document'
        });
      });
    }

    // Process thumbnail
    let thumbnail = null;
    if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
      const file = req.files.thumbnail[0];
      thumbnail = {
        data: file.buffer,
        contentType: file.mimetype
      };
    }

    // Create course with modules and materials
    console.log('Creating course with data:', {
      ...req.body,
      instructor: req.user._id,
      modules: modules,
      materials: materials,
      thumbnail: thumbnail
    });

    const course = new Course({
      title: req.body.title,
      description: req.body.description,
      duration: req.body.duration,
      department: req.body.department,
      instructor: req.user._id,
      youtubeLink: req.body.youtubeLink,
      modules: modules,
      materials: materials,
      thumbnail: thumbnail
    });
    
    const newCourse = await course.save();
    console.log('Course created successfully:', newCourse);
    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ 
      message: 'Error creating course', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get course materials
router.get('/:courseId/materials/:materialId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const material = course.materials.id(req.params.materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.set('Content-Type', material.fileData.contentType);
    res.send(material.fileData.data);
  } catch (error) {
    console.error('Error retrieving material:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update course (protected route)
router.put('/:id', protect, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'materialFiles', maxCount: 5 }
]), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    // Parse modules from JSON string
    let modules = [];
    if (req.body.modules) {
      try {
        modules = JSON.parse(req.body.modules);
      } catch (error) {
        console.error('Error parsing modules:', error);
      }
    }

    // Parse materials from JSON string
    let materials = [];
    if (req.body.materials) {
      try {
        materials = JSON.parse(req.body.materials);
      } catch (error) {
        console.error('Error parsing materials:', error);
      }
    }

    // Process uploaded files
    if (req.files && req.files.materialFiles && req.files.materialFiles.length > 0) {
      const materialTitles = Array.isArray(req.body.materialTitles) 
        ? req.body.materialTitles 
        : [req.body.materialTitles];
      
      const materialDescriptions = Array.isArray(req.body.materialDescriptions) 
        ? req.body.materialDescriptions 
        : [req.body.materialDescriptions];

      // Add uploaded files to materials
      req.files.materialFiles.forEach((file, index) => {
        materials.push({
          title: materialTitles[index] || file.originalname,
          description: materialDescriptions[index] || '',
          fileData: {
            data: file.buffer,
            contentType: file.mimetype
          },
          type: 'document'
        });
      });
    }

    // Process thumbnail
    let thumbnail = course.thumbnail;
    if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
      const file = req.files.thumbnail[0];
      thumbnail = {
        data: file.buffer,
        contentType: file.mimetype
      };
    }

    // Update course with new data, modules, and materials
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        duration: req.body.duration,
        department: req.body.department,
        youtubeLink: req.body.youtubeLink,
        modules: modules,
        materials: materials,
        thumbnail: thumbnail
      },
      { new: true }
    );

    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ 
      message: 'Error updating course', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete course (protected route)
router.delete('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if course is completed (all assignments graded above 60%)
router.get('/:id/check-completion', protect, async (req, res) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user._id;

    // Get all assignments for the course
    const assignments = await Assignment.find({ course: courseId });
    if (assignments.length === 0) {
      return res.json({ 
        completed: false,
        message: 'Course has no assignments' 
      });
    }

    // Get all graded results for this student in this course
    const gradedResults = await GradedResult.find({
      student: studentId,
      course: courseId
    });

    // Check if all assignments have been submitted and graded above 60%
    const allAssignmentsGraded = assignments.every(assignment => {
      const result = gradedResults.find(result => 
        result.assignment.toString() === assignment._id.toString()
      );
      return result && result.percentage >= 60;
    });

    res.json({
      completed: allAssignmentsGraded,
      message: allAssignmentsGraded ? 
        'All assignments completed with passing grades' : 
        'Not all assignments are completed with passing grades'
    });

  } catch (error) {
    console.error('Error checking course completion:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get courses by instructor
router.get('/instructor/:id', async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.params.id })
      .populate('instructor', 'name email');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get course thumbnail
router.get('/:courseId/thumbnail', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.thumbnail || !course.thumbnail.data) {
      return res.status(404).json({ message: 'Thumbnail not found' });
    }

    res.set('Content-Type', course.thumbnail.contentType);
    res.send(course.thumbnail.data);
  } catch (error) {
    console.error('Error retrieving thumbnail:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;