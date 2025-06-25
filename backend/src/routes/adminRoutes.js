const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/courses');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, JPEG, PNG, GIF, PDF, DOC, DOCX, and TXT files are allowed.'));
        }
    }
});

// Apply authentication middleware to all routes
router.use(protect);
router.use(isAdmin);

// Course routes
router.post('/courses', 
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'materialFiles', maxCount: 10 }
    ]), 
    adminController.createCourse
);
router.put('/courses/:id', 
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'materialFiles', maxCount: 10 }
    ]), 
    adminController.updateCourse
);
router.delete('/courses/:id', adminController.deleteCourse);

// Assignment routes
router.post('/assignments', adminController.createAssignment);
router.put('/assignments/:id', adminController.updateAssignment);
router.delete('/assignments/:id', adminController.deleteAssignment);

// Live Class routes
router.post('/live-classes', adminController.createLiveClass);
router.put('/live-classes/:id', adminController.updateLiveClass);
router.delete('/live-classes/:id', adminController.deleteLiveClass);
router.get('/live-classes', adminController.getAllLiveClasses);
router.get('/live-classes/:id', adminController.getLiveClassById);
router.post('/live-classes/:id/materials', adminController.uploadMaterials);
router.delete('/live-classes/:id/materials/:materialIndex', adminController.removeMaterial);

// Student Management
router.get('/students', adminController.getStudentDetails);

module.exports = router; 