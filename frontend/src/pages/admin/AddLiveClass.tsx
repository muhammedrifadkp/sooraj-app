import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUsers, FiVideo } from 'react-icons/fi';
import { liveClassService } from '../../services/liveClassService';
import { courseAPI } from '../../services/api';
import { Course } from '../../types/course';

const AddLiveClass: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        course: '',
        department: 'CSE',
        date: '',
        startTime: '',
        duration: 60,
        maxParticipants: 50,
        meetingLink: '',
        instructor: ''
    });

    useEffect(() => {
        loadCourses();
    }, [formData.department]); // Reload courses when department changes

    const loadCourses = async () => {
        try {
            setLoading(true);
            const response = await courseAPI.getAllCourses();
            const allCourses = response.data || [];
            console.log('All courses loaded:', allCourses);
            
            // Filter courses based on selected department
            const filteredCourses = allCourses.filter(course => 
                course.department === formData.department
            );
            console.log('Filtered courses for department', formData.department, ':', filteredCourses);
            
            // Ensure filteredCourses is always an array
            if (!Array.isArray(filteredCourses)) {
                console.error('Filtered courses is not an array', filteredCourses);
                setCourses([]);
            } else {
                setCourses(filteredCourses);
            }
        } catch (err) {
            console.error('Error loading courses:', err);
            setError('Failed to load courses');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Validate all required fields
            const requiredFields = {
                title: 'Title',
                description: 'Description',
                course: 'Course',
                date: 'Date',
                startTime: 'Start Time',
                duration: 'Duration',
                maxParticipants: 'Maximum Participants',
                meetingLink: 'Meeting Link'
            };

            const missingFields = Object.entries(requiredFields)
                .filter(([field]) => !formData[field as keyof typeof formData])
                .map(([_, label]) => label);

            if (missingFields.length > 0) {
                setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
                return;
            }

            // Validate duration is a positive number
            if (formData.duration <= 0) {
                setError('Duration must be a positive number');
                return;
            }

            // Validate maxParticipants is a positive number
            if (formData.maxParticipants <= 0) {
                setError('Maximum participants must be a positive number');
                return;
            }

            // Validate meeting link format
            if (!formData.meetingLink.startsWith('http://') && !formData.meetingLink.startsWith('https://')) {
                setError('Meeting link must be a valid URL starting with http:// or https://');
                return;
            }

            setIsSubmitting(true);
            setError('');

            // Combine date and time for startTime
            const dateStr = formData.date;
            const timeStr = formData.startTime;
            const startDateTime = new Date(`${dateStr}T${timeStr}`);
            
            // Validate the date is valid
            if (isNaN(startDateTime.getTime())) {
                throw new Error('Invalid date or time format');
            }

            // Create the data object to send
            const dataToSend = {
                title: formData.title,
                description: formData.description,
                course: formData.course,
                department: formData.department,
                startTime: startDateTime.toISOString(),
                duration: formData.duration,
                maxParticipants: formData.maxParticipants,
                meetingLink: formData.meetingLink,
                instructor: formData.instructor || undefined
            };

            // Log the data being sent
            console.log('Submitting live class data:', dataToSend);
            
            // Send the data to the API
            const response = await liveClassService.createLiveClass(dataToSend);
            console.log('Live class created successfully:', response);

            // Navigate to the live classes list
            navigate('/admin/live-classes');
        } catch (error: any) {
            console.error('Error creating live class:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create live class. Please try again.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                    <div className="p-6 sm:p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Schedule Live Class</h1>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Enter live class title"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                        Department <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="department"
                                        value={formData.department}
                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="CSE">Computer Science Engineering (CSE)</option>
                                        <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
                                        <option value="MECH">Mechanical Engineering (MECH)</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                                        Course <span className="text-red-500">*</span>
                                    </label>
                                    {loading ? (
                                        <div className="mt-1 p-2 bg-gray-100 rounded">Loading courses...</div>
                                    ) : (
                                        <select
                                            id="course"
                                            value={formData.course}
                                            onChange={(e) => handleInputChange('course', e.target.value)}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">Select a course</option>
                                            {courses.map(course => (
                                                <option key={course._id} value={course._id}>
                                                    {course.title}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        required
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Enter live class description"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="date"
                                        value={formData.date}
                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        id="startTime"
                                        value={formData.startTime}
                                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                                        Duration (minutes) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="duration"
                                        min="1"
                                        value={formData.duration}
                                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
                                        Maximum Participants <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="maxParticipants"
                                        min="1"
                                        value={formData.maxParticipants}
                                        onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700">
                                        Meeting Link <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        id="meetingLink"
                                        value={formData.meetingLink}
                                        onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="https://meet.google.com/..."
                                    />
                                </div>

                                <div>
                                    <label htmlFor="instructor" className="block text-sm font-medium text-gray-700">
                                        Instructor
                                    </label>
                                    <input
                                        type="text"
                                        id="instructor"
                                        value={formData.instructor}
                                        onChange={(e) => handleInputChange('instructor', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Enter instructor name"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Live Class'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AddLiveClass; 