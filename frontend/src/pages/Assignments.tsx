import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiCalendar, FiFileText, FiCheckCircle, FiArrowRight, FiClock } from 'react-icons/fi';
import { Button, Container, Alert, Spinner } from 'react-bootstrap';
import assignmentService from '../services/assignmentService';
import { Assignment } from '../types/assignment';
import { useAuth } from '../context/AuthContext';

export default function Assignments() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = async () => {
        try {
            setLoading(true);
            const data = await assignmentService.getAllAssignments();
            console.log('Loaded assignments:', data);
            
            // Debug submissions data
            data.forEach(assignment => {
                console.log(`Assignment ${assignment._id} submissions:`, assignment.submissions);
                if (assignment.submissions && assignment.submissions.length > 0) {
                    console.log('User ID:', user?._id);
                    const userSubmission = assignment.submissions.find(
                        submission => submission.student === user?._id
                    );
                    console.log('User submission found:', userSubmission);
                }
            });
            
            setAssignments(data);
        } catch (error) {
            console.error('Error loading assignments:', error);
            setError('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    const hasUserSubmitted = (assignment: Assignment): boolean => {
        if (!user || !assignment.submissions || assignment.submissions.length === 0) {
            return false;
        }
        
        // Handle both types of user IDs (string and object)
        const currentUserId = typeof user._id === 'string' ? user._id : user.id;
        
        console.log('Checking submission for user ID:', currentUserId);
        
        // More robust comparison of IDs to handle different formats
        const submitted = assignment.submissions.some(submission => {
            // Handle both string IDs and object IDs
            const submissionStudentId = typeof submission.student === 'object' 
                ? submission.student._id || submission.student.id
                : submission.student;
            
            const match = String(submissionStudentId) === String(currentUserId);
            
            if (match) {
                console.log('Found submission match for assignment:', assignment.title);
            }
            
            return match;
        });
        
        return submitted;
    };

    const getUserSubmission = (assignment: Assignment) => {
        if (!user || !assignment.submissions || assignment.submissions.length === 0) {
            return null;
        }
        
        // Handle both types of user IDs
        const currentUserId = typeof user._id === 'string' ? user._id : user.id;
        
        const submission = assignment.submissions.find(submission => {
            // Handle both string IDs and object IDs
            const submissionStudentId = typeof submission.student === 'object' 
                ? submission.student._id || submission.student.id
                : submission.student;
            
            return String(submissionStudentId) === String(currentUserId);
        });
        
        return submission;
    };

    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusColor = (assignment: Assignment) => {
        // Check submission status first
        if (hasUserSubmitted(assignment)) {
            return 'bg-green-100 text-green-800 border border-green-200';
        }

        const currentDate = new Date();
        const dueDate = new Date(assignment.dueDate);
        const isOverdue = currentDate > dueDate;

        if (isOverdue) {
            return 'bg-red-100 text-red-800 border border-red-200';
        }

        const isDueSoon = dueDate.getTime() - currentDate.getTime() < 24 * 60 * 60 * 1000;
        if (isDueSoon) {
            return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        }

        return 'bg-blue-100 text-blue-800 border border-blue-200';
    };

    const getStatusText = (assignment: Assignment) => {
        // Always check submission status first
        if (hasUserSubmitted(assignment)) {
            const submission = getUserSubmission(assignment);
            const submittedDate = submission ? new Date(submission.submittedAt).toLocaleDateString() : '';
            return `Submitted${submittedDate ? ` on ${submittedDate}` : ''}`;
        }

        const currentDate = new Date();
        const dueDate = new Date(assignment.dueDate);
        const isOverdue = currentDate > dueDate;

        if (isOverdue) {
            return 'Overdue';
        }

        const isDueSoon = dueDate.getTime() - currentDate.getTime() < 24 * 60 * 60 * 1000;
        if (isDueSoon) {
            return 'Due Soon';
        }

        return 'Pending';
    };

    const getButtonStyle = (assignment: Assignment) => {
        // Always check submission status first
        const submission = getUserSubmission(assignment);
        if (submission) {
            return 'bg-green-600 hover:bg-green-700 font-medium';
        }

        const currentDate = new Date();
        const dueDate = new Date(assignment.dueDate);
        const isOverdue = currentDate > dueDate;

        if (isOverdue) {
            return 'bg-red-500 hover:bg-red-600';
        }

        const isDueSoon = dueDate.getTime() - currentDate.getTime() < 24 * 60 * 60 * 1000;
        if (isDueSoon) {
            return 'bg-orange-500 hover:bg-orange-600';
        }

        return 'bg-indigo-500 hover:bg-indigo-600';
    };

    const getButtonText = (assignment: Assignment) => {
        // Always check submission status first
        const submission = getUserSubmission(assignment);
        if (submission) {
            return 'View Submission';
        }

        const currentDate = new Date();
        const dueDate = new Date(assignment.dueDate);
        const isOverdue = currentDate > dueDate;

        if (isOverdue) {
            return 'Submit Now';
        }

        const isDueSoon = dueDate.getTime() - currentDate.getTime() < 24 * 60 * 60 * 1000;
        if (isDueSoon) {
            return 'Submit Now';
        }

        return 'View Details';
    };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
            weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

    if (loading) {
        return (
            <Container className="py-5">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

  return (
        <Container className="py-5">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Assignments</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search assignments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssignments.map((assignment) => (
                    <motion.div
                        key={assignment._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        {typeof assignment.course === 'string' 
                                            ? assignment.course 
                                            : assignment.course.title}
                                    </p>
          </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(assignment)}`}>
                                    <div className="flex items-center">
                                        {hasUserSubmitted(assignment) ? (
                                            <>
                                                <FiCheckCircle className="mr-1 text-green-600" />
                                                <span>Submitted</span>
                                            </>
                                        ) : (
                                            <>
                                                {getStatusText(assignment) === 'Overdue' ? (
                                                    <FiClock className="mr-1 text-red-600" />
                                                ) : (
                                                    <FiClock className="mr-1" />
                                                )}
                                                <span>{getStatusText(assignment)}</span>
                                            </>
                      )}
                    </div>
                  </div>
      </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <p className="flex items-center">
                                    <FiCalendar className="mr-2" />
                                    Due: {formatDate(assignment.dueDate)}
                                </p>
                                {hasUserSubmitted(assignment) && (
                                    <p className="flex items-center text-green-600 font-medium">
                                        <FiCheckCircle className="mr-2" />
                                        {getStatusText(assignment)}
                                    </p>
                                )}
                </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => navigate(`/assignments/${assignment._id}`)}
                                    className={`${getButtonStyle(assignment)} text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200 ${
                                        hasUserSubmitted(assignment) ? 'shadow-md' : ''
                                    }`}
                                >
                                    {hasUserSubmitted(assignment) && <FiCheckCircle className="mr-2" />}
                                    <span>{getButtonText(assignment)}</span>
                                    <FiArrowRight className="ml-2" />
                      </button>
                    </div>
                  </div>
                    </motion.div>
                ))}
            </div>
        </Container>
  );
} 