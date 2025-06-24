import React, { useEffect, useState } from 'react';
import { Container, Button, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiAward, FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import { courseAPI, certificateAPI } from '../services/api';

interface Course {
    _id: string;
    title: string;
    description: string;
    instructor: string;
    department?: string;
    completionStatus?: string;
    completionDate?: string;
}

// Course department color mapping
const DEPARTMENT_COLORS = {
    'CSE': 'from-blue-500 to-indigo-600',
    'EEE': 'from-green-500 to-teal-600',
    'MECH': 'from-purple-500 to-indigo-600',
    'General': 'from-red-500 to-pink-600',
    'Other': 'from-yellow-500 to-orange-600'
};

const getDepartmentColor = (department: string): string => {
    return DEPARTMENT_COLORS[department] || DEPARTMENT_COLORS['Other'];
};

const Certificates: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [completionStatus, setCompletionStatus] = useState<{[key: string]: boolean}>({});
    const [downloading, setDownloading] = useState<{[key: string]: boolean}>({});

    const navigate = useNavigate();

    useEffect(() => {
        const checkCourseCompletion = async (courseId: string) => {
            try {
                const response = await courseAPI.checkCourseCompletion(courseId);
                setCompletionStatus(prev => ({
                    ...prev,
                    [courseId]: response.completed
                }));
            } catch (error) {
                console.error(`Error checking completion for course ${courseId}:`, error);
            }
        };

        const fetchCourses = async () => {
            try {
                setLoading(true);
                const enrolledCoursesData = await courseAPI.getEnrolledCourses();
                console.log('Raw enrolled courses data:', enrolledCoursesData);
                
                // Process the enrolled courses data
                const enrolledCourses = Array.isArray(enrolledCoursesData) 
                    ? enrolledCoursesData 
                    : [];
                
                console.log('Processed enrolled courses:', enrolledCourses);
                setCourses(enrolledCourses);
                
                // Check completion status for each course
                enrolledCourses.forEach(course => {
                    checkCourseCompletion(course._id);
                });
            } catch (error) {
                console.error('Error fetching courses:', error);
                setError('Failed to load your courses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return (
            <Container className="py-5">
                <div className="flex justify-center items-center h-64">
                    <Spinner animation="border" variant="primary" />
                    <span className="ml-2">Loading your certificates...</span>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <div className="bg-red-50 text-red-700 p-4 rounded-xl">
                    <h4 className="font-bold mb-2">Error</h4>
                    <p>{error}</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Your Certificates</h1>
                <p className="text-gray-600">View and download certificates for your completed courses</p>
            </div>

            {courses.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-xl text-center">
                    <FiAward className="text-gray-400 text-5xl mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">No Certificates Available</h3>
                    <p className="text-gray-500 mb-4">
                        Complete courses to earn certificates that will appear here.
                    </p>
                    <Button 
                        variant="primary"
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                        onClick={() => navigate('/courses')}
                    >
                        Browse Courses
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <motion.div
                            key={course._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
                        >
                            <div className={`bg-gradient-to-r ${getDepartmentColor(course.department || 'General')} h-24 flex items-center justify-center p-6`}>
                                <FiAward className="text-white text-4xl" />
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                        {course.department || 'General'}
                                    </span>
                                    {course.completionDate && (
                                        <span className="ml-auto">
                                            {new Date(course.completionDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="primary"
                                        className={`px-4 py-2 flex items-center text-sm rounded-lg ${completionStatus[course._id] ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                        disabled={!completionStatus[course._id] || downloading[course._id]}
                                        title={!completionStatus[course._id] ? 'Complete all assignments with passing grades to download certificate' : ''}
                                        onClick={async () => {
                                        try {
                                            setDownloading(prev => ({ ...prev, [course._id]: true }));
                                            const pdfBlob = await certificateAPI.downloadCertificate(course._id);
                                            
                                            // Create a URL for the blob
                                            const url = window.URL.createObjectURL(pdfBlob);
                                            
                                            // Create a temporary link and click it
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = `${course.title}-certificate.pdf`;
                                            document.body.appendChild(link);
                                            link.click();
                                            
                                            // Clean up
                                            document.body.removeChild(link);
                                            window.URL.revokeObjectURL(url);
                                        } catch (error) {
                                            console.error('Error downloading certificate:', error);
                                            // You might want to show an error toast here
                                        } finally {
                                            setDownloading(prev => ({ ...prev, [course._id]: false }));
                                        }
                                    }}
                                >
                                    <FiDownload className="mr-2" />
                                    {downloading[course._id] ? 'Downloading...' : 'Download Certificate'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </Container>
    );
};

export default Certificates; 