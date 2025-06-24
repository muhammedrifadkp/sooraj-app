const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const LiveClass = require('../models/LiveClass');
const User = require('../models/User');

// Course Management
exports.createCourse = async (req, res) => {
    try {
        // Extract form data
        const { title, description, duration, department, instructor, youtubeLink, modules } = req.body;
        
        // Validate required fields
        if (!title || !department || !duration) {
            return res.status(400).json({
                message: 'Missing required fields: title, department, and duration are required'
            });
        }

        // Validate department
        if (!['CSE', 'EEE', 'MECH'].includes(department)) {
            return res.status(400).json({
                message: 'Invalid department. Must be one of: CSE, EEE, MECH'
            });
        }

        // Prepare course data
        const courseData = {
            title: title.trim(),
            description: description?.trim() || '',
            duration: parseInt(duration),
            department,
            instructor,
            youtubeLink: youtubeLink?.trim() || '',
            modules: modules ? JSON.parse(modules) : []
        };

        // Handle thumbnail upload if present
        if (req.file) {
            courseData.thumbnail = req.file.path;
        }

        // Handle material files if present
        if (req.files && req.files.length > 0) {
            const materialFiles = req.files.map(file => ({
                path: file.path,
                originalname: file.originalname,
                mimetype: file.mimetype
            }));
            courseData.materialFiles = materialFiles;
        }

        // Log the course data
        console.log('Creating course with data:', courseData);

        const course = new Course(courseData);
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ 
            message: 'Failed to create course',
            error: error.message 
        });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        // Extract form data
        const { title, description, department, duration, youtubeLink, modules, materials } = req.body;
        
        // Validate required fields
        if (!title || !department || !duration) {
            return res.status(400).json({
                message: 'Missing required fields: title, department, and duration are required'
            });
        }

        // Validate department
        if (!['CSE', 'EEE', 'MECH'].includes(department)) {
            return res.status(400).json({
                message: 'Invalid department. Must be one of: CSE, EEE, MECH'
            });
        }

        // Prepare update data
        const updateData = {
            title: title.trim(),
            description: description?.trim() || '',
            department,
            duration: parseInt(duration),
            youtubeLink: youtubeLink?.trim() || '',
            modules: modules ? JSON.parse(modules) : [],
            materials: materials ? JSON.parse(materials) : []
        };

        // Handle thumbnail upload if present
        if (req.file) {
            updateData.thumbnail = req.file.path;
        }

        // Handle material files if present
        if (req.files && req.files.length > 0) {
            const materialFiles = req.files.map(file => ({
                path: file.path,
                originalname: file.originalname,
                mimetype: file.mimetype
            }));
            updateData.materialFiles = materialFiles;
        }

        // Log the update data
        console.log('Updating course with data:', updateData);

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ 
            message: 'Failed to update course',
            error: error.message 
        });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Assignment Management
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, course, dueDate, totalMarks, department } = req.body;

        // Validate required fields
        const requiredFields = ['title', 'description', 'course', 'dueDate', 'totalMarks'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate course exists
        const courseExists = await Course.findById(course);
        if (!courseExists) {
            return res.status(400).json({
                message: 'Invalid course ID. Course not found'
            });
        }

        // Validate department
        if (department && !['CSE', 'EEE', 'MECH'].includes(department)) {
            return res.status(400).json({
                message: 'Invalid department. Must be one of: CSE, EEE, MECH'
            });
        }

        // Validate title and description length
        if (title.length < 3 || title.length > 100) {
            return res.status(400).json({
                message: 'Title must be between 3 and 100 characters'
            });
        }

        if (description.length < 10 || description.length > 1000) {
            return res.status(400).json({
                message: 'Description must be between 10 and 1000 characters'
            });
        }

        // Validate totalMarks is a positive number
        if (isNaN(totalMarks) || totalMarks <= 0 || totalMarks > 100) {
            return res.status(400).json({
                message: 'Total marks must be a positive number between 1 and 100'
            });
        }

        // Validate dueDate is a future date
        const dueDateObj = new Date(dueDate);
        const now = new Date();
        if (isNaN(dueDateObj.getTime())) {
            return res.status(400).json({
                message: 'Invalid date format for due date'
            });
        }
        if (dueDateObj < now) {
            return res.status(400).json({
                message: 'Due date must be in the future'
            });
        }

        const assignment = new Assignment(req.body);
        await assignment.save();
        res.status(201).json(assignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.json(assignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndDelete(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Live Class Management
exports.createLiveClass = async (req, res) => {
    try {
        const { title, description, course, startTime, duration, maxParticipants, meetingLink, department } = req.body;

        // Validate required fields
        const requiredFields = ['title', 'description', 'course', 'startTime', 'duration', 'maxParticipants', 'meetingLink'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate department
        if (department && !['CSE', 'EEE', 'MECH'].includes(department)) {
            return res.status(400).json({
                message: 'Invalid department. Must be one of: CSE, EEE, MECH'
            });
        }

        // Validate start time and calculate end time
        const startTimeObj = new Date(startTime);
        const now = new Date();

        if (isNaN(startTimeObj.getTime()) || startTimeObj < now) {
            return res.status(400).json({
                message: 'Start time must be a valid future date'
            });
        }

        // Calculate end time based on duration (in minutes)
        const durationInMinutes = parseInt(duration);
        if (isNaN(durationInMinutes) || durationInMinutes < 15) {
            return res.status(400).json({
                message: 'Duration must be at least 15 minutes'
            });
        }

        const endTimeObj = new Date(startTimeObj.getTime() + durationInMinutes * 60000);

        // Validate max participants
        const maxParticipantsNum = parseInt(maxParticipants);
        if (isNaN(maxParticipantsNum) || maxParticipantsNum < 1) {
            return res.status(400).json({
                message: 'Maximum participants must be at least 1'
            });
        }

        // Create live class with calculated end time and current user as instructor
        const liveClass = new LiveClass({
            title,
            description,
            course,
            department: department || 'CSE',
            instructor: req.user._id, // Set current user as instructor
            startTime: startTimeObj,
            endTime: endTimeObj,
            meetingLink,
            maxParticipants: maxParticipantsNum,
            status: 'scheduled',
            materials: [] // Initialize with empty materials array
        });

        await liveClass.save();

        // Populate course and instructor details before sending response
        await liveClass.populate(['course', 'instructor']);
        
        res.status(201).json(liveClass);
    } catch (error) {
        console.error('Error creating live class:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.updateLiveClass = async (req, res) => {
    try {
        console.log('Updating live class with data:', req.body);
        
        // Find the existing live class
        const existingLiveClass = await LiveClass.findById(req.params.id);
        if (!existingLiveClass) {
            return res.status(404).json({ message: 'Live class not found' });
        }

        // Extract data from request
        const { title, description, course, startTime, duration, maxParticipants, meetingLink, department, status } = req.body;

        // Validate required fields
        const requiredFields = ['title', 'description', 'course', 'startTime', 'duration', 'maxParticipants', 'meetingLink'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate department
        if (department && !['CSE', 'EEE', 'MECH'].includes(department)) {
            return res.status(400).json({
                message: 'Invalid department. Must be one of: CSE, EEE, MECH'
            });
        }

        // Validate start time and calculate end time
        const startTimeObj = new Date(startTime);
        const now = new Date();

        if (isNaN(startTimeObj.getTime())) {
            return res.status(400).json({
                message: 'Start time must be a valid date'
            });
        }

        // Calculate end time based on duration (in minutes)
        const durationInMinutes = parseInt(duration);
        if (isNaN(durationInMinutes) || durationInMinutes < 15) {
            return res.status(400).json({
                message: 'Duration must be at least 15 minutes'
            });
        }

        const endTimeObj = new Date(startTimeObj.getTime() + durationInMinutes * 60000);

        // Validate max participants
        const maxParticipantsNum = parseInt(maxParticipants);
        if (isNaN(maxParticipantsNum) || maxParticipantsNum < 1) {
            return res.status(400).json({
                message: 'Maximum participants must be at least 1'
            });
        }

        // Prepare update data
        const updateData = {
            title,
            description,
            course,
            department: department || existingLiveClass.department,
            startTime: startTimeObj,
            endTime: endTimeObj,
            meetingLink,
            maxParticipants: maxParticipantsNum,
            status: status || existingLiveClass.status,
            instructor: existingLiveClass.instructor // Keep the existing instructor
        };

        // Handle file uploads if any
        if (req.files && req.files.length > 0) {
            const materials = req.files.map(file => ({
                name: file.originalname,
                url: `/uploads/materials/${file.filename}`,
                type: file.mimetype
            }));

            // Add new materials to existing ones
            updateData.materials = [...(existingLiveClass.materials || []), ...materials];
        }

        // Update the live class
        const updatedLiveClass = await LiveClass.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate(['course', 'instructor']);

        res.json(updatedLiveClass);
    } catch (error) {
        console.error('Error updating live class:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteLiveClass = async (req, res) => {
    try {
        const liveClass = await LiveClass.findByIdAndDelete(req.params.id);
        if (!liveClass) {
            return res.status(404).json({ message: 'Live class not found' });
        }
        res.json({ message: 'Live class deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllLiveClasses = async (req, res) => {
    try {
        const { department } = req.query;
        
        // Build query based on department if provided
        const query = department ? { department } : {};
        
        const liveClasses = await LiveClass.find(query)
            .populate('course')
            .populate('instructor')
            .populate('participants');
        res.json(liveClasses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.uploadMaterials = async (req, res) => {
    try {
        const liveClass = await LiveClass.findById(req.params.id);
        if (!liveClass) {
            return res.status(404).json({ message: 'Live class not found' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const materials = req.files.map(file => ({
            name: file.originalname,
            url: `/uploads/materials/${file.filename}`,
            type: file.mimetype
        }));

        // Add new materials to existing ones
        liveClass.materials = [...(liveClass.materials || []), ...materials];
        await liveClass.save();

        res.status(200).json(liveClass);
    } catch (error) {
        console.error('Error uploading materials:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.getLiveClassById = async (req, res) => {
    try {
        const liveClass = await LiveClass.findById(req.params.id)
            .populate('course', 'title')
            .populate('instructor', 'name email');
        
        if (!liveClass) {
            return res.status(404).json({ message: 'Live class not found' });
        }
        
        res.json(liveClass);
    } catch (error) {
        console.error('Error fetching live class:', error);
        res.status(500).json({ message: 'Error fetching live class', error: error.message });
    }
};

// Student Management
exports.getStudentDetails = async (req, res) => {
    try {
        console.log('Fetching students...');
        // Get all students
        const students = await User.find({ role: 'student' })
            .select('name email department');
        
        console.log('Found students:', students);

        if (!students || students.length === 0) {
            console.log('No students found in database');
            return res.json([]); // Return empty array if no students found
        }

        console.log('Fetching assignments...');
        // Get all assignments with populated course data
        const assignments = await Assignment.find()
            .populate({
                path: 'course',
                select: 'department title'
            });
        console.log('Found assignments:', assignments.length);

        console.log('Fetching live classes...');
        // Get all live classes with populated course data
        const liveClasses = await LiveClass.find()
            .populate({
                path: 'course',
                select: 'department title'
            });
        console.log('Found live classes:', liveClasses.length);

        console.log('Fetching courses...');
        // Get all courses
        const courses = await Course.find().select('department title');
        console.log('Found courses:', courses.length);

        // Process student data
        console.log('Processing student data...');
        const studentDetails = await Promise.all(students.map(async (student) => {
            console.log(`Processing student: ${student.name} (${student.department})`);
            
            // Get student's assignments
            const studentAssignments = assignments.filter(assignment => 
                assignment.course && assignment.course.department === student.department
            );
            console.log(`Found ${studentAssignments.length} assignments for student`);

            // Get student's live classes
            const studentLiveClasses = liveClasses.filter(liveClass => 
                liveClass.course && liveClass.course.department === student.department
            );
            console.log(`Found ${studentLiveClasses.length} live classes for student`);

            // Get student's courses
            const studentCourses = courses.filter(course => 
                course.department === student.department
            );
            console.log(`Found ${studentCourses.length} courses for student`);

            // Calculate assignment statistics
            const submittedAssignments = studentAssignments.filter(a => 
                a.submissions && a.submissions.some(s => s.student.toString() === student._id.toString())
            );
            
            // Calculate average score from submissions
            let totalScore = 0;
            let totalSubmissions = 0;
            
            submittedAssignments.forEach(assignment => {
                const submission = assignment.submissions.find(s => s.student.toString() === student._id.toString());
                if (submission && submission.evaluation) {
                    // Use the percentage score from the evaluation
                    totalScore += submission.evaluation.percentage;
                    totalSubmissions++;
                }
            });
            
            const averageScore = totalSubmissions > 0 ? Math.round(totalScore / totalSubmissions) : 0;
            
            const assignmentStats = {
                submitted: submittedAssignments.length,
                total: studentAssignments.length,
                averageScore: averageScore
            };
            console.log(`Assignment stats: ${assignmentStats.submitted}/${assignmentStats.total} submitted, avg score: ${averageScore}%`);

            // Calculate attendance statistics
            const presentClasses = studentLiveClasses.filter(lc => 
                lc.participants && lc.participants.includes(student._id)
            );
            const attendanceStats = {
                present: presentClasses.length,
                total: studentLiveClasses.length,
                percentage: studentLiveClasses.length > 0 
                    ? Math.round((presentClasses.length / studentLiveClasses.length) * 100)
                    : 0
            };
            console.log(`Attendance stats: ${attendanceStats.present}/${attendanceStats.total} present (${attendanceStats.percentage}%)`);

            // Calculate course statistics
            const completedCourses = studentCourses.filter(course => 
                course.completedBy && course.completedBy.includes(student._id)
            );
            const courseStats = {
                enrolled: studentCourses.length,
                completed: completedCourses.length
            };
            console.log(`Course stats: ${courseStats.completed}/${courseStats.enrolled} completed`);

            return {
                _id: student._id,
                name: student.name,
                email: student.email,
                department: student.department,
                assignments: assignmentStats,
                attendance: attendanceStats,
                courses: courseStats
            };
        }));

        console.log('Sending response with student details:', studentDetails.length);
        res.json(studentDetails);
    } catch (error) {
        console.error('Error getting student details:', error);
        res.status(500).json({ 
            message: 'Error retrieving student details',
            error: error.message 
        });
    }
};

exports.removeMaterial = async (req, res) => {
    try {
        const { materialIndex } = req.params;
        const liveClass = await LiveClass.findById(req.params.id);
        
        if (!liveClass) {
            return res.status(404).json({ message: 'Live class not found' });
        }
        
        // Check if materials array exists and has the specified index
        if (!liveClass.materials || !liveClass.materials[parseInt(materialIndex)]) {
            return res.status(400).json({ message: 'Material not found' });
        }
        
        // Remove the material at the specified index
        liveClass.materials.splice(parseInt(materialIndex), 1);
        await liveClass.save();
        
        res.json({ message: 'Material removed successfully', liveClass });
    } catch (error) {
        console.error('Error removing material:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = exports;