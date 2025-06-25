import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus, FiFilter, FiBook, FiClock, FiUser, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Button, Container, Row, Col, Modal, Form } from 'react-bootstrap';
import CourseCard from '../components/CourseCard';
import courseService from '../services/courseService';
import { Course } from '../types/course';

interface CourseInstructor {
    _id: string;
    name: string;
    email: string;
}

export default function Courses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDuration, setSelectedDuration] = useState<string>('all');
    const [selectedInstructor, setSelectedInstructor] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        duration: '',
        department: 'CSE' as 'CSE' | 'EEE' | 'MECH',
        materials: [] as any[]
    });

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const data = await courseService.getAllCourses();
            
            // Improved transformation to ensure instructor is safely processed
            const transformedData = data.map(course => {
                let safeInstructor;
                
                // Handle instructor which can be a string or an object
                if (!course.instructor) {
                    safeInstructor = 'Unknown';
                } else if (typeof course.instructor === 'string') {
                    safeInstructor = course.instructor;
                } else if (typeof course.instructor === 'object') {
                    // Ensure we have valid properties
                    safeInstructor = {
                        _id: course.instructor._id || '',
                        name: course.instructor.name || 'Unknown',
                        email: course.instructor.email || ''
                    };
                } else {
                    safeInstructor = 'Unknown';
                }
                
                return {
                    ...course,
                    instructor: safeInstructor
                };
            });

            // Filter courses based on user's department if they are a student
            const filteredData = user?.role === 'student' && user?.department
                ? transformedData.filter(course => course.department === user.department)
                : transformedData;

            console.log('User department:', user?.department);
            console.log('Filtered courses count:', filteredData.length);
            console.log('Total courses count:', transformedData.length);

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
                title: newCourse.title,
                description: newCourse.description,
                duration: newCourse.duration,
                department: newCourse.department,
                instructor: user?.id || '',
                materials: newCourse.materials
            });
            setShowModal(false);
            setNewCourse({
                title: '',
                description: '',
                duration: '',
                department: 'CSE',
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

  return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
            <Container>
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Explore Our Courses
                    </h1>
                    <p className="text-lg text-gray-600">
                        Discover a wide range of courses to enhance your skills
                    </p>
                </motion.div>

                {/* Search and Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex-grow max-w-xs">
          <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search courses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
          </div>
        </div>
      </div>
                </motion.div>

                {/* Courses Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredCourses.map((course, index) => (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <CourseCard course={course} />
                                </motion.div>
                      ))}
                    </div>
                    </motion.div>
                )}

                {/* No Results Message */}
                {!loading && filteredCourses.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">
                            No courses found
                        </h3>
                        <p className="mt-1 text-gray-500">
                            Try adjusting your search to find what you're looking for.
                        </p>
                    </motion.div>
                )}

                {/* Create Course Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton className="border-b-0">
                        <Modal.Title className="text-xl font-bold">Create New Course</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleCreateCourse}>
                            <Form.Group className="mb-4">
                                <Form.Label className="font-medium">Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newCourse.title}
                                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                                    className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="font-medium">Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={newCourse.description}
                                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                    className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="font-medium">Duration</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newCourse.duration}
                                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                                    className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit">
                                Create Course
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
    </div>
  );
}