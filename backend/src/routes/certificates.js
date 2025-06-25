const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect, isAdmin, isInstructor } = require('../middleware/authMiddleware');
const PDFDocument = require('pdfkit');
const moment = require('moment');

// Get all certificates (admin only)
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('student', 'name email')
      .populate('course', 'title')
      .populate('instructor', 'name');
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download certificate as PDF
router.get('/download/:courseId', protect, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user._id;

    // Get course and student details
    const course = await Course.findById(courseId).populate('instructor', 'name');
    const student = await User.findById(studentId);

    if (!course || !student) {
      return res.status(404).json({ message: 'Course or student not found' });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${student.name}-${course.title}-certificate.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add certificate content
    doc.font('Helvetica-Bold')
       .fontSize(30)
       .text('Certificate of Completion', { align: 'center' });

    doc.moveDown(2);

    doc.fontSize(16)
       .text('This is to certify that', { align: 'center' });

    doc.moveDown();

    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(student.name, { align: 'center' });

    doc.moveDown();

    doc.fontSize(16)
       .font('Helvetica')
       .text(`from ${student.department}`, { align: 'center' });

    doc.moveDown();

    doc.text('has successfully completed the course', { align: 'center' });

    doc.moveDown();

    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(course.title, { align: 'center' });

    doc.moveDown(2);

    doc.fontSize(14)
       .font('Helvetica')
       .text(`Instructor: ${course.instructor.name}`, { align: 'center' });

    doc.moveDown();

    doc.text(`Date: ${moment().format('MMMM Do, YYYY')}`, { align: 'center' });

    // Add a border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .stroke();

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    res.status(500).json({ message: 'Error generating certificate' });
  }
});

// Get student's certificates
router.get('/my-certificates', protect, async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('course', 'title')
      .populate('instructor', 'name');
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get certificates for a specific course
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const certificates = await Certificate.find({ 
      course: req.params.courseId,
      student: req.user._id
    })
      .populate('course', 'title')
      .populate('instructor', 'name');
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Issue course completion certificate
router.post('/course-completion', protect, async (req, res) => {
  try {
    console.log('=== Starting course completion certificate creation ===');
    console.log('Request body:', req.body);
    console.log('User:', { id: req.user._id, name: req.user.name, email: req.user.email });
    console.log('Course ID from request:', req.body.courseId);

    const { courseId } = req.body;
    if (!courseId) {
      console.log('Error: Course ID is missing in request body');
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const studentId = req.user._id;
    if (!studentId) {
      console.log('Error: User ID is missing from authenticated user');
      return res.status(400).json({ message: 'User ID is missing' });
    }

    // Get the course with instructor populated
    console.log('Fetching course details...');
    const course = await Course.findById(courseId).populate('instructor');
    if (!course) {
      console.log(`Error: Course not found with ID: ${courseId}`);
      return res.status(404).json({ message: 'Course not found' });
    }
    console.log('Found course:', { id: course._id, title: course.title, instructor: course.instructor?._id });

    // Check if certificate already exists
    console.log('Checking for existing certificate...');
    const existingCertificate = await Certificate.findOne({
      student: studentId,
      course: courseId,
      courseCompletion: true
    });

    if (existingCertificate) {
      console.log('Error: Certificate already exists:', { certificateId: existingCertificate._id });
      return res.status(400).json({ 
        message: 'Course completion certificate already exists',
        certificateId: existingCertificate._id
      });
    }

    // Generate certificate number
    console.log('Generating certificate number...');
    const count = await Certificate.countDocuments();
    const timestamp = Date.now().toString().slice(-6);
    const certificateNumber = `CERT-${timestamp}-${count + 1}`;
    console.log('Generated certificate number:', certificateNumber);

    // Create certificate
    console.log('Creating new certificate...');
    const certificate = new Certificate({
      student: studentId,
      course: courseId,
      instructor: course.instructor._id,
      grade: 'Completed',
      completionDate: new Date(),
      certificateNumber: certificateNumber,
      signature: 'Course Instructor',
      courseCompletion: true
    });

    console.log('Saving certificate to database...');
    const newCertificate = await certificate.save();
    console.log('Successfully saved certificate:', { 
      id: newCertificate._id,
      certificateNumber: newCertificate.certificateNumber,
      student: newCertificate.student,
      course: newCertificate.course
    });

    res.status(201).json(newCertificate);

  } catch (error) {
    console.error('=== Error in course completion certificate creation ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Handle specific error types
    if (error.name === 'ValidationError') {
      console.error('Validation error details:', error.errors);
      return res.status(400).json({
        message: 'Invalid certificate data',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.name === 'MongoServerError' && error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return res.status(400).json({
        message: 'Certificate with this number already exists',
        field: Object.keys(error.keyValue)[0]
      });
    }

    // Generic error response
    res.status(500).json({
      message: 'Failed to create certificate',
      error: error.message
    });
  }
});

// Issue certificate (instructor only)
router.post('/', protect, isInstructor, async (req, res) => {
  try {
    const { studentId, courseId, assignmentId, grade, completionDate } = req.body;

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      student: studentId,
      course: courseId,
      assignment: assignmentId
    });

    if (existingCertificate) {
      return res.status(400).json({ message: 'Certificate already exists for this student and assignment' });
    }

    const certificate = new Certificate({
      student: studentId,
      course: courseId,
      assignment: assignmentId,
      instructor: req.user._id,
      grade,
      completionDate,
      signature: req.user.name
    });

    const newCertificate = await certificate.save();
    res.status(201).json(newCertificate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update certificate status (admin only)
router.put('/:id/status', protect, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json(certificate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete certificate (admin only)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 