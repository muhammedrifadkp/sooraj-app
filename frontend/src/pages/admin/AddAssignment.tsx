import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiMinus, FiCalendar, FiClock } from 'react-icons/fi';
import { assignmentAPI } from '../../services/api';
import { courseAPI } from '../../services/api';
import { Course } from '../../types/course';

interface Question {
    text: string;
    type: 'multiple-choice' | 'short-answer' | 'long-answer';
    options?: string[];
    correctAnswer?: string;
}

const AddAssignment: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([
        { text: '', type: 'multiple-choice', options: ['', '', '', ''], correctAnswer: '' }
    ]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        course: '',
        department: 'CSE',
        dueDate: '',
        totalMarks: '',
        instructions: ''
    });

    useEffect(() => {
        loadCourses();
    }, [formData.department]);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const response = await courseAPI.getAllCourses();
            const coursesData = response.data || [];
            
            // Filter courses based on selected department
            const filteredCourses = coursesData.filter((course: Course) => 
                course.department === formData.department
            );
            console.log('Filtered courses for department', formData.department, ':', filteredCourses);
            
            setCourses(filteredCourses);
        } catch (error) {
            console.error('Error loading courses:', error);
            setError('Failed to load courses');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // If department changes, reset course selection
        if (name === 'department') {
            setFormData(prev => ({ ...prev, [name]: value, course: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, { text: '', type: 'multiple-choice', options: ['', '', '', ''], correctAnswer: '' }]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index: number, field: keyof Question, value: string | string[]) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
        const newQuestions = [...questions];
        if (!newQuestions[questionIndex].options) {
            newQuestions[questionIndex].options = ['', '', '', ''];
        }
        newQuestions[questionIndex].options![optionIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const formDataToSend = new FormData();
            
            // Add basic fields
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('course', formData.course);
            formDataToSend.append('department', formData.department);
            formDataToSend.append('dueDate', formData.dueDate);
            formDataToSend.append('totalMarks', formData.totalMarks);
            formDataToSend.append('instructions', formData.instructions);
            
            // Add questions
            formDataToSend.append('questions', JSON.stringify(questions));

            await assignmentAPI.createAssignment(formDataToSend);
            navigate('/admin/assignments');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create assignment');
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Assignment</h1>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assignment Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter assignment title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course
                                    </label>
                                    {loading ? (
                                        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                            Loading courses...
                                        </div>
                                    ) : (
                                        <select
                                            name="course"
                                            value={formData.course}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Department
                                    </label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="CSE">Computer Science Engineering (CSE)</option>
                                        <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
                                        <option value="MECH">Mechanical Engineering (MECH)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter assignment description"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Due Date
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="datetime-local"
                                            name="dueDate"
                                            value={formData.dueDate}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                                        />
                                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Marks
                                    </label>
                                    <input
                                        type="number"
                                        name="totalMarks"
                                        value={formData.totalMarks}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter total marks"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Instructions
                                </label>
                                <textarea
                                    name="instructions"
                                    value={formData.instructions}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter assignment instructions"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Questions
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <FiPlus className="mr-1" />
                                        Add Question
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {questions.map((question, index) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-lg font-medium text-gray-900">Question {index + 1}</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => removeQuestion(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <FiMinus />
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Question Text
                                                    </label>
                                                    <textarea
                                                        value={question.text}
                                                        onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                                                        required
                                                        rows={2}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Enter question text"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Question Type
                                                    </label>
                                                    <select
                                                        value={question.type}
                                                        onChange={(e) => handleQuestionChange(index, 'type', e.target.value as Question['type'])}
                                                        required
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="multiple-choice">Multiple Choice</option>
                                                        <option value="short-answer">Short Answer</option>
                                                        <option value="long-answer">Long Answer</option>
                                                    </select>
                                                </div>

                                                {question.type === 'multiple-choice' && (
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Options
                                                        </label>
                                                        {question.options?.map((option, optionIndex) => (
                                                            <div key={optionIndex} className="flex items-center space-x-2">
                                                                <input
                                                                    type="text"
                                                                    value={option}
                                                                    onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                                                                    required
                                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    placeholder={`Option ${optionIndex + 1}`}
                                                                />
                                                                <input
                                                                    type="radio"
                                                                    name={`correct-${index}`}
                                                                    checked={question.correctAnswer === option}
                                                                    onChange={() => handleQuestionChange(index, 'correctAnswer', option)}
                                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {(question.type === 'short-answer' || question.type === 'long-answer') && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Correct Answer
                                                        </label>
                                                        <textarea
                                                            value={question.correctAnswer || ''}
                                                            onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                                                            required
                                                            rows={question.type === 'long-answer' ? 4 : 2}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder={`Enter the ${question.type === 'long-answer' ? 'detailed' : 'brief'} correct answer`}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Assignment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AddAssignment; 