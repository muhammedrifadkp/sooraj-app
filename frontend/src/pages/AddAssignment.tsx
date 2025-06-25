import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiUpload, FiX, FiTrash2 } from 'react-icons/fi';
import { Button, Container, Form } from 'react-bootstrap';
import { assignmentAPI, courseAPI } from '../services/api';
import axios from 'axios';
import { Course } from '../types/course';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Optionally define API_URL if not available
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AddAssignment() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        course: '',
        department: 'CSE',
        dueDate: '',
        totalMarks: 0,
        instructions: '',
        questions: [{
            text: '',
            type: 'multiple-choice',
            options: ['', '', '', ''],
            correctAnswer: '',
            answer: '',
            marks: 0
        }],
        attachments: [] as { name: string; url: string; type: string; }[]
    });
    const [error, setError] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [fileError, setFileError] = useState('');
    const [allCourses, setAllCourses] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            loadCourses();
        }
    }, [user, formData.department]);

    useEffect(() => {
        filterCoursesByDepartment();
    }, [formData.department, allCourses]);

    const loadCourses = async () => {
        try {
            setLoading(true);
            let coursesData: any[] = [];
            
            if (user?.role === 'Admin') {
                const response = await courseAPI.getAllCourses();
                coursesData = response.data || [];
                console.log('All courses loaded:', coursesData);
            } else if (user?.role === 'Instructor') {
                const response = await axios.get(`${API_URL}/courses/instructor/${user._id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                coursesData = response.data || [];
                console.log('Instructor courses loaded:', coursesData);
            } else {
                const coursesResponse = await courseAPI.getEnrolledCourses();
                coursesData = Array.isArray(coursesResponse) ? coursesResponse : [];
                console.log('Student enrolled courses loaded:', coursesData);
            }

            console.log('Loaded courses:', coursesData);
            setAllCourses(coursesData);
            filterCoursesByDepartment(coursesData);
        } catch (error) {
            console.error('Error loading courses:', error);
            setError('Failed to load courses');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const filterCoursesByDepartment = (coursesToFilter = allCourses) => {
        const filteredCourses = coursesToFilter.filter(course => 
            course.department === formData.department
        );
        console.log('Filtered courses:', filteredCourses);
        setCourses(filteredCourses);
        
        // Reset course selection if the selected course is not in the filtered list
        if (!filteredCourses.find(course => course._id === formData.course)) {
            setFormData(prev => ({ ...prev, course: '' }));
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleQuestionChange = (index: number, field: string, value: any) => {
        console.log('Changing question', index, field, value); // Debug log
        setFormData(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[index] = {
                ...newQuestions[index],
                [field]: value,
                // Reset answer when changing question type
                ...(field === 'type' && value !== 'multiple-choice' && value !== 'true-false' ? { answer: '' } : {})
            };
            return { ...prev, questions: newQuestions };
        });
    };

    const handleAnswerChange = (index: number, value: string) => {
        console.log('Changing answer for question', index, value); // Debug log
        handleQuestionChange(index, 'answer', value);
    };

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, {
                text: '',
                type: 'multiple-choice',
                options: ['', '', '', ''],
                correctAnswer: '',
                answer: '',
                marks: 0
            }]
        }));
    };

    const removeQuestion = (index: number) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        const invalidFiles = selectedFiles.filter(file => {
            if (file.size > maxSize) {
                setFileError(`${file.name} is too large. Maximum file size is 10MB.`);
                return true;
            }
            if (!allowedTypes.includes(file.type)) {
                setFileError(`${file.name} is not a supported file type. Please upload PDF or DOC files.`);
                return true;
            }
            return false;
        });

        if (invalidFiles.length === 0) {
            setFiles(prev => [...prev, ...selectedFiles]);
            setFileError('');
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // Validate form data
            if (!formData.title || !formData.description || !formData.course || !formData.dueDate) {
                setError('Please fill in all required fields');
                return;
            }

            if (formData.questions.length === 0) {
                setError('Please add at least one question');
                return;
            }

            // Create FormData object for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('course', formData.course);
            formDataToSend.append('department', formData.department);
            formDataToSend.append('dueDate', formData.dueDate);
            formDataToSend.append('totalMarks', formData.totalMarks.toString());
            formDataToSend.append('instructions', formData.instructions);

            // Add questions one by one
            formData.questions.forEach((question, index) => {
                formDataToSend.append(`questions[${index}][text]`, question.text);
                formDataToSend.append(`questions[${index}][type]`, question.type);
                
                if (question.type === 'multiple-choice') {
                    question.options.forEach((option, optionIndex) => {
                        formDataToSend.append(`questions[${index}][options][${optionIndex}]`, option);
                    });
                    formDataToSend.append(`questions[${index}][correctAnswer]`, question.correctAnswer);
                } else if (question.type === 'true-false') {
                    formDataToSend.append(`questions[${index}][correctAnswer]`, question.correctAnswer);
                } else if (question.type === 'short-answer') {
                    formDataToSend.append(`questions[${index}][correctAnswer]`, question.correctAnswer);
                    formDataToSend.append(`questions[${index}][answer]`, question.answer);
                }
            });
            
            // Append files
            files.forEach((file, index) => {
                formDataToSend.append('files', file, file.name);
            });

            console.log('Submitting assignment with course:', formData.course);
            await assignmentAPI.createAssignment(formDataToSend);
            toast.success('Assignment created successfully!');
            navigate('/admin/assignments');
        } catch (error) {
            console.error('Error creating assignment:', error);
            setError('Failed to create assignment');
        }
    };

    return (
        <Container className="py-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Assignment</h1>
                    <p className="text-gray-600">Add a new assignment for your students</p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-md p-6"
            >
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <Form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Form.Group>
                            <Form.Label>Title <span className="text-red-500">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                required
                                placeholder="Enter assignment title"
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Department <span className="text-red-500">*</span></Form.Label>
                            <Form.Select
                                value={formData.department}
                                onChange={(e) => handleInputChange('department', e.target.value)}
                                required
                            >
                                <option value="CSE">Computer Science Engineering (CSE)</option>
                                <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
                                <option value="MECH">Mechanical Engineering (MECH)</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Course <span className="text-red-500">*</span></Form.Label>
                            {loading ? (
                                <div className="p-2 bg-gray-100 rounded">Loading courses...</div>
                            ) : (
                                <Form.Select
                                    value={formData.course}
                                    onChange={(e) => handleInputChange('course', e.target.value)}
                                    required
                                >
                                    <option value="">Select a course</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </Form.Select>
                            )}
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Description <span className="text-red-500">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                required
                                placeholder="Enter assignment description"
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Due Date <span className="text-red-500">*</span></Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={formData.dueDate}
                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Total Marks <span className="text-red-500">*</span></Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                value={formData.totalMarks}
                                onChange={(e) => handleInputChange('totalMarks', parseInt(e.target.value))}
                                required
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Instructions</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.instructions}
                                onChange={(e) => handleInputChange('instructions', e.target.value)}
                                placeholder="Enter assignment instructions"
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Attachments</Form.Label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                            <span>Upload files</span>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                multiple
                                                onChange={handleFileChange}
                                                className="sr-only"
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                </div>
                            </div>
                            {files.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
                                    <div className="mt-2 space-y-2">
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span className="text-sm text-gray-600">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {fileError && (
                                <p className="mt-2 text-sm text-red-600">{fileError}</p>
                            )}
                        </Form.Group>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                            <Button
                                variant="outline-primary"
                                onClick={addQuestion}
                                className="flex items-center"
                            >
                                <FiPlus className="mr-2" /> Add Question
                            </Button>
                        </div>

                        {formData.questions.map((question, index) => (
                            <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-md font-medium text-gray-700">Question {index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FiX />
                                    </button>
                                </div>

                                <Form.Group className="mb-3">
                                    <Form.Label>Question Text <span className="text-red-500">*</span></Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={question.text}
                                        onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <div className="mt-3">
                                    <Form.Label>Question Type <span className="text-red-500">*</span></Form.Label>
                                    <Form.Select
                                        value={question.type}
                                        onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                                        required
                                    >
                                        <option value="multiple-choice">Multiple Choice</option>
                                        <option value="true-false">True/False</option>
                                        <option value="short-answer">Short Answer</option>
                                        <option value="long-answer">Long Answer</option>
                                    </Form.Select>
                                </div>

                                {question.type === 'multiple-choice' && (
                                    <div className="mt-3">
                                        <Form.Label>Options <span className="text-red-500">*</span></Form.Label>
                                        <div className="space-y-2">
                                            {question.options.map((option, optionIndex) => (
                                                <Form.Control
                                                    key={optionIndex}
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => {
                                                        const newOptions = [...question.options];
                                                        newOptions[optionIndex] = e.target.value;
                                                        handleQuestionChange(index, 'options', newOptions);
                                                    }}
                                                    placeholder={`Option ${optionIndex + 1}`}
                                                    required
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {question.type === 'true-false' && (
                                    <div className="mt-3">
                                        <Form.Label>Correct Answer <span className="text-red-500">*</span></Form.Label>
                                        <Form.Select
                                            value={question.correctAnswer}
                                            onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                                            required
                                        >
                                            <option value="">Select correct answer</option>
                                            <option value="true">True</option>
                                            <option value="false">False</option>
                                        </Form.Select>
                                    </div>
                                )}

                                {question.type === 'short-answer' && (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <Form.Label>Correct Answer <span className="text-red-500">*</span></Form.Label>
                                            <span className="text-sm text-gray-500">(For grading reference)</span>
                                        </div>
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            value={question.answer}
                                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                                            placeholder="Enter the correct answer and explanation here..."
                                            required
                                            className="resize-none"
                                        />
                                        <Form.Text className="text-sm text-gray-500 mt-1">
                                            This will be used as the reference answer when grading student submissions
                                        </Form.Text>
                                    </div>
                                )}

                                {question.type === 'long-answer' && (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <Form.Label>Correct Answer <span className="text-red-500">*</span></Form.Label>
                                            <span className="text-sm text-gray-500">(For grading reference)</span>
                                        </div>
                                        <Form.Control
                                            as="textarea"
                                            rows={6}
                                            value={question.answer}
                                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                                            placeholder="Enter the correct answer and explanation here..."
                                            required
                                            className="resize-none"
                                        />
                                        <Form.Text className="text-sm text-gray-500 mt-1">
                                            This will be used as the reference answer when grading student submissions
                                        </Form.Text>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button type="submit" variant="primary">
                            Create Assignment
                        </Button>
                    </div>
                </Form>
            </motion.div>
        </Container>
    );
} 