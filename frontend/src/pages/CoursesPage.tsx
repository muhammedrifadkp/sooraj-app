import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiClock, FiBook, FiUser, FiPlus, FiArrowRight } from 'react-icons/fi';
import { courseService, Course } from '../services/courseService';
import { useAuth } from '../context/AuthContext';
import { Button, Modal, Form } from 'react-bootstrap';
import SafeDisplay from '../components/SafeDisplay';

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        duration: '',
        materials: []
    });
    const { user } = useAuth();

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const data = await courseService.getAllCourses();
            
            // Filter courses based on user's department if they are a student
            const filteredData = user?.role === 'student' && user?.department
                ? data.filter(course => course.department === user.department)
                : data;
            
            console.log('User department:', user?.department);
            console.log('Filtered courses count:', filteredData.length);
            console.log('Total courses count:', data.length);
                
            setCourses(filteredData);
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await courseService.createCourse({
                ...newCourse,
                instructor: user?._id || ''
            });
            setShowModal(false);
            setNewCourse({
                title: '',
                description: '',
                duration: '',
                materials: []
            });
            loadCourses();
        } catch (error) {
            console.error('Error creating course:', error);
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getDepartmentColor = (department: string) => {
        switch (department) {
            case 'CSE':
                return 'bg-blue-100 text-blue-800';
            case 'EEE':
                return 'bg-green-100 text-green-800';
            case 'MECH':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <FiPlus className="mr-1" />
                            <span>Add Course</span>
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                    <FiBook className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search to find what you're looking for.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <motion.div
                            key={course._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        <SafeDisplay value={course.title} defaultValue="Untitled Course" />
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDepartmentColor(course.department)}`}>
                                        <SafeDisplay value={course.department} defaultValue="General" />
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    <SafeDisplay value={course.description} defaultValue="No description available" />
                                </p>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-gray-500">
                                        <FiClock className="mr-2" />
                                        <span><SafeDisplay value={course.duration} defaultValue="N/A" /></span>
                                    </div>
                                    <div className="flex items-center text-gray-500">
                                        <FiUser className="mr-2" />
                                        <span>Instructor: <SafeDisplay 
                                            value={
                                                typeof course.instructor === 'object' && course.instructor !== null
                                                    ? course.instructor.name 
                                                    : course.instructor
                                            } 
                                            defaultValue="Unknown" 
                                        /></span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.location.href = `/courses/${course._id}`}
                                    className="w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center space-x-2 bg-indigo-500 hover:bg-indigo-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                >
                                    <FiArrowRight className="mr-2" />
                                    <span>View Details</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Course</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreateCourse}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={newCourse.title}
                                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={newCourse.description}
                                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Duration</Form.Label>
                            <Form.Control
                                type="text"
                                value={newCourse.duration}
                                onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Create Course
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
} 