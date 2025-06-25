const LiveClass = require('../models/LiveClass');

exports.getLiveClasses = async (req, res) => {
    try {
        // Get the student's department from the authenticated user
        const department = req.user.department;
        
        if (!department) {
            return res.status(400).json({ message: 'Student department not found' });
        }

        // Find live classes for the student's department
        const liveClasses = await LiveClass.find({ department })
            .populate('course', 'title')
            .populate('instructor', 'name email')
            .populate('participants');
            
        res.json(liveClasses);
    } catch (error) {
        console.error('Error fetching live classes:', error);
        res.status(500).json({ message: error.message });
    }
}; 