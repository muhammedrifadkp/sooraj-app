import React from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiClock, FiUser, FiStar, FiArrowRight } from 'react-icons/fi';
import { Course } from '../types/course';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import SafeDisplay from './SafeDisplay';

interface CourseCardProps {
    course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const navigate = useNavigate();

    // Safely access instructor information
    const getInstructorInfo = () => {
        if (typeof course.instructor === 'object' && course.instructor !== null) {
            return course.instructor.name || 'Unknown Instructor';
        }
        return typeof course.instructor === 'string' ? course.instructor : 'Unknown Instructor';
    };

    // Ensure instructor is never rendered directly
    const safeInstructor = getInstructorInfo();

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
            {/* Course Thumbnail */}
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
                {course.thumbnail ? (
                    <img
                        src={`${API_URL}/courses/${course._id}/thumbnail`}
                        alt={course.title}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                            console.error('Error loading thumbnail:', e);
                            e.currentTarget.src = `${API_URL}/uploads/thumbnails/default.jpg`;
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FiBook className="text-white text-6xl" />
                    </div>
                )}
            </div>

            {/* Course Content */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    <SafeDisplay value={course.title} defaultValue="Untitled Course" />
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                    <SafeDisplay value={course.description} defaultValue="No description available" />
                </p>

                {/* Course Stats */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                        <FiClock className="mr-1" />
                        <span><SafeDisplay value={course.duration} defaultValue="N/A" /></span>
                    </div>
                </div>
                
                {/* Instructor */}
                <div className="flex items-center text-gray-600 mb-3">
                    <FiUser className="mr-1" />
                    <span>Instructor: <SafeDisplay value={safeInstructor} defaultValue="Unknown" /></span>
                </div>

                {/* Rating and Action */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <FiStar className="text-yellow-400 mr-1" />
                        <span className="text-gray-700 font-semibold">
                            <SafeDisplay 
                                value={course.rating ? course.rating.toFixed(1) : 'New'} 
                                defaultValue="New" 
                            />
                        </span>
                    </div>
                    <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200"
                    >
                        View Details
                        <FiArrowRight className="ml-1" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default CourseCard; 