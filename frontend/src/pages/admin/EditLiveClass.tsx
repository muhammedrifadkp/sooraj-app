import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FiArrowLeft, FiSave, FiBook, FiClock, FiUsers, FiCalendar, FiLink, FiInfo, FiX } from 'react-icons/fi';
import { liveClassService } from '../../services/liveClassService';
import courseService from '../../services/courseService';
import { LiveClass } from '../../types/liveClass';
import { Course } from '../../types/course';
import { toast } from 'react-toastify';

const EditLiveClass: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [liveClassData, coursesData] = await Promise.all([
                liveClassService.getLiveClassById(id!),
                courseService.getAllCourses()
            ]);

            // Log the received data for debugging
            console.log('Received live class data:', liveClassData);
            console.log('Received courses data:', coursesData);

            // Ensure all required fields are present
            const initializedLiveClass = {
                ...liveClassData,
                title: liveClassData.title || '',
                description: liveClassData.description || '',
                course: liveClassData.course?._id || liveClassData.course || '',
                startTime: liveClassData.startTime || '',
                duration: liveClassData.duration || 15,
                maxParticipants: liveClassData.maxParticipants || 1,
                meetingLink: liveClassData.meetingLink || '',
                department: liveClassData.department || 'CSE',
                status: liveClassData.status || 'scheduled'
            };

            console.log('Initialized live class data:', initializedLiveClass);
            setLiveClass(initializedLiveClass);
            setCourses(coursesData);
        } catch (err) {
            setError('Failed to load live class data');
            console.error('Error fetching data:', err);
            toast.error('Failed to load live class data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        setLiveClass(prev => {
            if (!prev) return null;

            // Log the change for debugging
            console.log(`Updating field ${name} with value:`, value);

            // Special handling for course field
            if (name === 'course') {
                return { ...prev, course: value };
            }

            // Special handling for numeric fields
            if (name === 'duration' || name === 'maxParticipants') {
                const numValue = parseInt(value, 10);
                if (isNaN(numValue)) return prev;
                
                // For duration, ensure it's at least 15
                if (name === 'duration' && numValue < 15) {
                    toast.warning('Duration must be at least 15 minutes');
                    return prev;
                }
                
                return { ...prev, [name]: numValue };
            }

            // Special handling for datetime-local field
            if (name === 'startTime') {
                return { ...prev, [name]: value };
            }

            // For all other fields, just update the value
            return { ...prev, [name]: value };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (!liveClass) {
                throw new Error('No live class data available');
            }

            // Log the current state for debugging
            console.log('Current live class state before validation:', liveClass);

            // Validate required fields
            const requiredFields = ['title', 'description', 'course', 'startTime', 'duration', 'maxParticipants', 'meetingLink'];
            const missingFields = requiredFields.filter(field => {
                const value = liveClass[field as keyof LiveClass];
                return !value || (typeof value === 'string' && !value.trim());
            });

            if (missingFields.length > 0) {
                console.log('Missing fields:', missingFields);
                throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            }

            // Validate numeric fields
            if (typeof liveClass.duration !== 'number' || liveClass.duration < 15) {
                throw new Error('Duration must be at least 15 minutes');
            }

            if (typeof liveClass.maxParticipants !== 'number' || liveClass.maxParticipants < 1) {
                throw new Error('Maximum participants must be at least 1');
            }

            // Validate meeting link format
            const urlPattern = /^https?:\/\/.+/;
            if (!urlPattern.test(liveClass.meetingLink)) {
                throw new Error('Meeting link must be a valid URL starting with http:// or https://');
            }

            // Create data object to send
            const dataToSend = {
                title: liveClass.title.trim(),
                description: liveClass.description.trim(),
                course: typeof liveClass.course === 'object' ? liveClass.course._id : liveClass.course,
                startTime: new Date(liveClass.startTime).toISOString(),
                duration: liveClass.duration,
                maxParticipants: liveClass.maxParticipants,
                meetingLink: liveClass.meetingLink.trim(),
                department: liveClass.department,
                status: liveClass.status
            };

            // Log the data being sent
            console.log('Data being sent:', dataToSend);

            // Update live class
            await liveClassService.updateLiveClass(id!, dataToSend);
            toast.success('Live class updated successfully');
            navigate('/admin/live-classes');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update live class';
            setError(errorMessage);
            console.error('Error updating live class:', err);
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Spinner animation="border" variant="primary" />
                </div>
                <p className="mt-3 text-gray-600 font-medium">Loading live class details...</p>
            </Container>
        );
    }

    if (error || !liveClass) {
        return (
            <Container className="py-5">
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-gray-100">
                    <Alert variant="danger" className="border-0 bg-red-50 text-red-700 rounded-xl">
                        <div className="flex items-center">
                            <div className="bg-red-100 p-3 rounded-full mr-4">
                                <FiX className="text-red-500 text-xl" />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold">Error</h4>
                                <p className="mb-0">{error || 'Live class not found'}</p>
                            </div>
                        </div>
                    </Alert>
                    <div className="mt-6 flex justify-center">
                        <Button 
                            variant="outline-primary" 
                            className="rounded-xl px-5 py-2.5 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                            onClick={() => navigate('/admin/live-classes')}
                        >
                            <FiArrowLeft className="me-2" />
                            Back to Live Classes
                        </Button>
                    </div>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4 px-3 px-md-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
                <div className="p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Live Class</h1>
                            <p className="text-gray-500 mt-1">Update the details of your live class</p>
                        </div>
                        <Button 
                            variant="outline-primary" 
                            className="rounded-xl px-4 py-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                            onClick={() => navigate('/admin/live-classes')}
                        >
                            <FiArrowLeft className="me-2" />
                            Back to Live Classes
                        </Button>
                    </div>
                </div>

                <Form onSubmit={handleSubmit} className="p-4 sm:p-6">
                    <div className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <Form.Group className="mb-3 sm:mb-4">
                                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                                            <FiBook className="text-indigo-500" />
                                        </div>
                                        Class Title
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={liveClass.title}
                                        onChange={handleInputChange}
                                        required
                                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </Form.Group>
                            </div>

                            <div>
                                <Form.Group className="mb-3 sm:mb-4">
                                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                                            <FiBook className="text-indigo-500" />
                                        </div>
                                        Course
                                    </Form.Label>
                                    <Form.Select
                                        name="course"
                                        value={typeof liveClass.course === 'object' ? liveClass.course._id : liveClass.course}
                                        onChange={handleInputChange}
                                        required
                                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2"
                                    >
                                        <option value="">Select a course</option>
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>
                                                {course.title}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            <div>
                                <Form.Group className="mb-3 sm:mb-4">
                                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                                            <FiCalendar className="text-indigo-500" />
                                        </div>
                                        Start Time
                                    </Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="startTime"
                                        value={liveClass.startTime}
                                        onChange={handleInputChange}
                                        required
                                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </Form.Group>
                            </div>

                            <div>
                                <Form.Group className="mb-3 sm:mb-4">
                                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                                            <FiClock className="text-indigo-500" />
                                        </div>
                                        Duration (minutes)
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="duration"
                                        value={liveClass.duration}
                                        onChange={handleInputChange}
                                        min="15"
                                        required
                                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </Form.Group>
                            </div>

                            <div>
                                <Form.Group className="mb-3 sm:mb-4">
                                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                                            <FiUsers className="text-indigo-500" />
                                        </div>
                                        Maximum Participants
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="maxParticipants"
                                        value={liveClass.maxParticipants}
                                        onChange={handleInputChange}
                                        min="1"
                                        required
                                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </Form.Group>
                            </div>

                            <div>
                                <Form.Group className="mb-3 sm:mb-4">
                                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                                            <FiLink className="text-indigo-500" />
                                        </div>
                                        Meeting Link
                                    </Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="meetingLink"
                                        value={liveClass.meetingLink}
                                        onChange={handleInputChange}
                                        required
                                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="https://meet.google.com/..."
                                    />
                                </Form.Group>
                            </div>

                            <div>
                                <Form.Group className="mb-3 sm:mb-4">
                                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                                            <FiBook className="text-indigo-500" />
                                        </div>
                                        Department
                                    </Form.Label>
                                    <Form.Select
                                        name="department"
                                        value={liveClass.department}
                                        onChange={handleInputChange}
                                        required
                                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2"
                                    >
                                        <option value="CSE">Computer Science Engineering (CSE)</option>
                                        <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
                                        <option value="MECH">Mechanical Engineering (MECH)</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            <div>
                                <Form.Group className="mb-3 sm:mb-4">
                                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                                            <FiBook className="text-indigo-500" />
                                        </div>
                                        Status
                                    </Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={liveClass.status}
                                        onChange={handleInputChange}
                                        required
                                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2"
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="ongoing">Live</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <Form.Group className="mb-3 sm:mb-4">
                                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                                            <FiInfo className="text-indigo-500" />
                                        </div>
                                        Description
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={6}
                                        name="description"
                                        value={liveClass.description}
                                        onChange={handleInputChange}
                                        required
                                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[150px] w-full"
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end mt-4 sm:mt-5 gap-2">
                            <Button 
                                type="button"
                                variant="outline-secondary"
                                onClick={() => navigate('/admin/live-classes')}
                                className="rounded-xl px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium w-full sm:w-auto order-2 sm:order-1"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 w-full sm:w-auto order-1 sm:order-2"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="me-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Form>
            </motion.div>
        </Container>
    );
};

export default EditLiveClass; 