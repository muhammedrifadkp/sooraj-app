import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiFileText, FiCheckCircle, FiDownload, FiSend, FiLock, FiAward } from 'react-icons/fi';
import { Button, Container, Alert, Form } from 'react-bootstrap';
import assignmentService from '../services/assignmentService';
import { Assignment } from '../types/assignment';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { toast } from 'react-hot-toast';
import { gradedResultAPI } from '../services/api';
import './AssignmentDetails.css';

// Extract the base URL from API_URL (remove /api)
const BASE_URL = API_URL.replace('/api', '');

interface Answer {
    questionId: number;
    answer: string;
}

interface Submission {
    student: string;
    answers: Answer[];
    submittedAt: string;
    marks?: number;
    feedback?: string;
    evaluation?: any;
}

interface GradedAnswer {
    questionId: number;
    questionText: string;
    questionType: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    marks: number;
    maxMarks: number;
    feedback: string;
}

interface GradedResult {
    _id: string;
    assignment: any;
    student: any;
    course: any;
    submittedAt: string;
    gradedAt: string;
    answers: GradedAnswer[];
    totalMarks: number;
    earnedMarks: number;
    percentage: number;
    scaledScore: number;
    status: string;
    overallFeedback: string;
    comments: string;
    certificateIssued: boolean;
    certificateId?: string;
}

interface EvaluationResult {
    earned: number;
    total: number;
    percentage: number;
    scaledScore: number;
}

export default function AssignmentDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
    const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
    const [hasShownSubmittedToast, setHasShownSubmittedToast] = useState(false);
    const [gradedResult, setGradedResult] = useState<GradedResult | null>(null);
    const [isProgress, setIsProgress] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [progressStats, setProgressStats] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });

    useEffect(() => {
        loadAssignment();
    }, [id]);

    useEffect(() => {
        if (existingSubmission && !hasShownSubmittedToast) {
            toast.success('Assignment has been successfully submitted!', {
                duration: 5000,
                icon: '✅',
            });
            setHasShownSubmittedToast(true);
        }
    }, [existingSubmission, hasShownSubmittedToast]);

    const checkForExistingSubmission = (data: Assignment) => {
        if (!data.submissions || !user) {
            console.log('No submissions data or user not available');
            return null;
        }
        
        console.log('Checking submissions for user:', user._id);
        console.log('Available submissions:', data.submissions);
        
        // Log each submission's student ID for debugging
        data.submissions.forEach((sub: Submission, index: number) => {
            console.log(`Submission ${index} student ID:`, sub.student);
            console.log(`Submission ${index} student ID type:`, typeof sub.student);
            console.log(`Current user ID:`, user._id);
            console.log(`Current user ID type:`, typeof user._id);
            console.log(`String comparison:`, String(sub.student) === String(user._id));
        });
        
        // Try different comparison methods
        let userSubmission = null;
        
        // Method 1: Direct string comparison
        userSubmission = data.submissions.find(
            (sub: Submission) => String(sub.student) === String(user._id)
        );
        
        // Method 2: Try with ObjectId comparison if Method 1 fails
        if (!userSubmission) {
            userSubmission = data.submissions.find(
                (sub: Submission) => {
                    // Try to extract the ID part if it's an ObjectId string
                    const subId = String(sub.student).split('"')[1] || String(sub.student);
                    const userId = String(user._id).split('"')[1] || String(user._id);
                    console.log('Comparing extracted IDs:', subId, userId);
                    return subId === userId;
                }
            );
        }
        
        if (userSubmission) {
            console.log('Found existing submission:', userSubmission);
            return userSubmission;
        } else {
            console.log('No existing submission found for user');
            console.log('User ID:', user._id);
            console.log('Submission student IDs:', data.submissions.map((sub: Submission) => sub.student));
            return null;
        }
    };

    const loadAssignment = async () => {
        try {
            setLoading(true);
            if (!id) return;
            const data = await assignmentService.getAssignmentById(id);
            setAssignment(data);
            console.log('Loaded assignment data:', data);

            // Initialize answers array with empty answers for each question
            const initialAnswers = data.questions.map((_, index) => ({
                questionId: index,
                answer: ''
            }));
            setAnswers(initialAnswers);

            // Check for existing submission
            const userSubmission = checkForExistingSubmission(data);
            
            if (userSubmission) {
                setExistingSubmission(userSubmission);
                setAnswers(userSubmission.answers);
                setSubmitSuccess(true);
                
                // Set evaluation result if available
                if (userSubmission.marks !== undefined) {
                    const totalQuestions = data.questions.length;
                    const correctAnswers = userSubmission.marks;
                    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
                    
                    setEvaluationResult({
                        earned: correctAnswers,
                        total: totalQuestions,
                        percentage: percentage,
                        scaledScore: userSubmission.marks
                    });
                }
            }

            // Always try to load graded result from server
            try {
                console.log('Checking for graded result...');
                const result = await gradedResultAPI.getByAssignmentId(id);
                console.log('Found graded result:', result);
                if (result) {
                    setGradedResult(result);
                    setSubmitSuccess(true);
                    
                    // Create the evaluation result from the graded result
                    setEvaluationResult({
                        earned: result.earnedMarks,
                        total: result.totalMarks,
                        percentage: result.percentage,
                        scaledScore: result.scaledScore
                    });
                    
                    // Also create the submission object for backward compatibility
                    setExistingSubmission({
                        student: result.student._id || '',
                        answers: result.answers.map(a => ({
                            questionId: a.questionId,
                            answer: a.studentAnswer
                        })),
                        submittedAt: result.submittedAt,
                        feedback: result.overallFeedback,
                        evaluation: {
                            earnedMarks: result.earnedMarks,
                            totalMarks: result.totalMarks,
                            percentage: result.percentage,
                            scaledScore: result.scaledScore
                        }
                    });
                    
                    // Clear any saved progress since we found a submission
                    clearSavedProgress();
                }
            } catch (gradedResultError) {
                console.log('Error fetching graded result:', gradedResultError);
                // If no graded result is found, that's okay - we'll use the submission data
            }
        } catch (error) {
            console.error('Error loading assignment:', error);
            setError('Failed to load assignment');
        } finally {
            setLoading(false);
        }
    };

    // Add function to load graded result directly from server
    const loadGradedResultFromServer = async () => {
        try {
            if (!id || !user) return false;
            
            console.log('Attempting to fetch graded result data from server...');
            
            try {
                const result = await gradedResultAPI.getByAssignmentId(id);
                console.log('Server returned graded result data:', result);
                
                if (result) {
                    setGradedResult(result);
                    setSubmitSuccess(true);
                    
                    // Create the evaluation result from the graded result
                    setEvaluationResult({
                        earned: result.earnedMarks,
                        total: result.totalMarks,
                        percentage: result.percentage,
                        scaledScore: result.scaledScore
                    });
                    
                    // Also create the submission object for backward compatibility
                    setExistingSubmission({
                        student: user._id || '',
                        answers: result.answers.map(a => ({
                            questionId: a.questionId,
                            answer: a.studentAnswer
                        })),
                        submittedAt: result.submittedAt,
                        feedback: result.overallFeedback,
                        evaluation: {
                            earnedMarks: result.earnedMarks,
                            totalMarks: result.totalMarks,
                            percentage: result.percentage,
                            scaledScore: result.scaledScore
                        }
                    });
                    
                    // Clear any saved progress since we found a submission
                    clearSavedProgress();
                    
                    return true;
                }
            } catch (gradedResultError) {
                console.log('Error fetching graded result, trying legacy API:', gradedResultError);
                
                // Fall back to legacy submission API if graded result not found
                const response = await assignmentService.getAssignmentSubmission(id);
                console.log('Server returned submission data:', response);
                
                if (response && response.submission) {
                    setExistingSubmission({
                        student: user._id || '',
                        answers: response.submission.answers || [],
                        submittedAt: response.submission.submittedAt,
                        marks: response.submission.marks,
                        feedback: response.submission.feedback,
                        evaluation: response.submission.evaluation
                    });
                    setAnswers(response.submission.answers || []);
                    setSubmitSuccess(true);
                    
                    // Set evaluation result if available
                    if (response.submission.evaluation) {
                        setEvaluationResult({
                            earned: response.submission.evaluation.earnedMarks,
                            total: response.submission.evaluation.totalMarks,
                            percentage: response.submission.evaluation.percentage,
                            scaledScore: response.submission.evaluation.scaledScore
                        });
                    }
                    
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error fetching submission or graded result:', error);
            return false;
        }
    };

    // Add a debug effect to log the state
    useEffect(() => {
        console.log('Assignment state:', {
            existingSubmission,
            submitSuccess,
            answers: answers.length
        });
    }, [existingSubmission, submitSuccess, answers]);

    // Save current progress to localStorage
    const saveProgress = () => {
        if (id && user && !existingSubmission && isProgress) {
            try {
                localStorage.setItem(
                    `assignment_progress_${id}_${user._id}`, 
                    JSON.stringify({
                        answers,
                        timestamp: new Date().toISOString()
                    })
                );
                setLastSaved(new Date());
                console.log('Progress auto-saved to localStorage');
            } catch (error) {
                console.error('Error saving progress to localStorage:', error);
            }
        }
    };
    
    // Set up auto-save interval
    useEffect(() => {
        // Only set up auto-save if user is actively working on the assignment
        if (!existingSubmission && isProgress) {
            const intervalId = setInterval(() => {
                saveProgress();
            }, 30000); // Auto-save every 30 seconds
            
            return () => clearInterval(intervalId);
        }
    }, [id, user, existingSubmission, isProgress, answers]);
    
    // Update progress stats whenever answers change
    useEffect(() => {
        if (assignment) {
            const completedCount = answers.filter(answer => answer.answer && answer.answer.trim() !== '').length;
            setProgressStats({
                completed: completedCount,
                total: assignment.questions.length
            });
        }
    }, [answers, assignment]);
    
    // Clear saved progress
    const clearSavedProgress = () => {
        if (id && user) {
            try {
                localStorage.removeItem(`assignment_progress_${id}_${user._id}`);
                console.log('Cleared saved progress');
            } catch (error) {
                console.error('Error clearing saved progress:', error);
            }
        }
    };
    
    // Discard progress and reset answers
    const handleDiscardProgress = () => {
        if (window.confirm('Are you sure you want to discard your progress? All your answers will be reset.')) {
            // Reset answers to empty
            if (assignment) {
                setAnswers(assignment.questions.map((_, index) => ({
                    questionId: index,
                    answer: ''
                })));
            }
            
            // Clear saved progress
            clearSavedProgress();
            
            // Reset states
            setIsProgress(false);
            setLastSaved(null);
            
            toast.success('Progress discarded. You can start fresh.', {
                duration: 3000,
            });
        }
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        // Prevent changes if already submitted
        if (existingSubmission) return;
        
        setAnswers(prevAnswers => {
            // Find the answer object for this question or create a new one
            const existingAnswerIndex = prevAnswers.findIndex(a => a.questionId === questionId);
            
            if (existingAnswerIndex === -1) {
                // If no answer exists for this question, add it
                return [...prevAnswers, { questionId, answer: answer.trim() }];
            }
            
            // Update existing answer
            const updatedAnswers = [...prevAnswers];
            updatedAnswers[existingAnswerIndex] = { ...updatedAnswers[existingAnswerIndex], answer: answer.trim() };
            
            // Check if any answer has content to determine if assignment is in progress
            const hasAnyAnswers = updatedAnswers.some(a => a.answer.trim() !== '');
            setIsProgress(hasAnyAnswers);
            
            // Update last saved timestamp when answers change
            if (hasAnyAnswers) {
                setLastSaved(new Date());
                
                // Save progress to localStorage
                if (id && user) {
                    try {
                        localStorage.setItem(
                            `assignment_progress_${id}_${user._id}`, 
                            JSON.stringify({
                                answers: updatedAnswers,
                                timestamp: new Date().toISOString()
                            })
                        );
                        console.log('Progress saved to localStorage');
                    } catch (error) {
                        console.error('Error saving progress to localStorage:', error);
                    }
                }
            }
            
            return updatedAnswers;
        });
    };

    // Check for and load saved progress from localStorage
    useEffect(() => {
        if (id && user && !existingSubmission && !loading) {
            try {
                const savedProgress = localStorage.getItem(`assignment_progress_${id}_${user._id}`);
                if (savedProgress) {
                    const { answers: savedAnswers, timestamp } = JSON.parse(savedProgress);
                    
                    // Only set if we have valid saved answers and the answers aren't already set
                    if (savedAnswers && savedAnswers.length > 0 && answers.every(a => !a.answer)) {
                        console.log('Loading saved progress from localStorage:', savedAnswers);
                        setAnswers(savedAnswers);
                        setIsProgress(true);
                        setLastSaved(new Date(timestamp));
                        
                        toast.success('Your previous progress has been loaded', {
                            duration: 3000,
                            icon: '💾',
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading progress from localStorage:', error);
            }
        }
    }, [id, user, existingSubmission, loading]);

    const handleSubmit = async () => {
        try {
            // Prevent submission if already submitted
            if (existingSubmission || gradedResult) {
                console.log('Preventing submission: User has already submitted this assignment');
                setSubmitError('You have already submitted this assignment');
                toast.info('You have already submitted this assignment', {
                    duration: 3000,
                });
                return;
            }

            setSubmitting(true);
            setSubmitError(null);
            setSubmitSuccess(false);
            setEvaluationResult(null);

            if (!id) return;

            // Validate that all questions are answered
            const unansweredQuestions = answers.filter(a => !a.answer);
            if (unansweredQuestions.length > 0) {
                setSubmitError('Please answer all questions before submitting');
                setSubmitting(false);
                return;
            }

            console.log('Submitting assignment with answers:', answers);
            const result = await assignmentService.submitAssignment(id, answers);
            console.log('Submission successful:', result);
            setSubmitSuccess(true);
            setEvaluationResult(result.score);
            
            // If the response includes a gradedResultId, fetch the full graded result
            if (result.gradedResultId) {
                try {
                    const gradedResult = await gradedResultAPI.getById(result.gradedResultId);
                    setGradedResult(gradedResult);
                } catch (gradedResultError) {
                    console.error('Error fetching graded result after submission:', gradedResultError);
                }
            }
            
            setExistingSubmission({
                student: user?._id || '',
                answers: answers,
                submittedAt: new Date().toISOString(),
                marks: result.submission.marks,
                feedback: result.submission.feedback,
                evaluation: result.submission.evaluation
            });
            
            // Clear saved progress after successful submission
            clearSavedProgress();
            
            // Show success toast
            toast.success('Assignment submitted successfully!', {
                duration: 5000,
                icon: '✅',
            });
            
        } catch (error) {
            console.error('Error submitting assignment:', error);
            
            // Check for "already submitted" error
            if (error instanceof Error && 
                (error.message.includes('already submitted') || 
                error.message.includes('You have already submitted this assignment'))) {
                console.log('Detected already submitted error in component');
                
                // Try to fetch the submission data from the server
                const loaded = await loadGradedResultFromServer();
                
                if (loaded) {
                    // If submission data was loaded successfully, show a success toast
                    toast.success('Your assignment was previously submitted', {
                        duration: 5000,
                        icon: '✅',
                    });
                } else {
                    // If we couldn't load the submission data, show error
                    setSubmitError('Assignment already submitted.');
                    toast.error('Assignment already submitted', {
                        duration: 5000,
                    });
                }
            } else {
                // For other errors, show the error message
                const errorMessage = error instanceof Error ? error.message : 'Failed to submit assignment. Please try again.';
                setSubmitError(errorMessage);
                toast.error(errorMessage, {
                    duration: 5000,
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Render the saved indicator with progress stats
    const renderSavedIndicator = () => {
        if (!isProgress || existingSubmission) return null;
        
        return (
            <div className="progress-indicator">
                <div className="progress-dot"></div>
                <div className="flex-1">
                    <div className="flex justify-between">
                        <span>
                            Progress saved {lastSaved ? `(${lastSaved.toLocaleTimeString()})` : ''}
                        </span>
                        <span className="font-medium">
                            {progressStats.completed}/{progressStats.total} answered
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${(progressStats.completed / progressStats.total) * 100}%` }}
                        ></div>
                    </div>
                </div>
                <button 
                    onClick={handleDiscardProgress}
                    className="ml-3 text-xs text-red-600 hover:text-red-800 transition-colors"
                    title="Discard progress and start over"
                >
                    Reset
                </button>
            </div>
        );
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

    if (error || !assignment) {
        return (
            <Container className="py-5">
                <Alert variant="danger" className="border-0 bg-red-50 text-red-700 rounded-xl">
                    <div className="flex items-center">
                        <div className="bg-red-100 p-3 rounded-full mr-4">
                            <FiFileText className="text-red-500 text-xl" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold">Error</h4>
                            <p className="mb-0">{error || 'Assignment not found'}</p>
                        </div>
                    </div>
                </Alert>
                <div className="mt-6 flex justify-center">
                    <Button 
                        variant="outline-primary" 
                        className="rounded-xl px-5 py-2.5 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                        onClick={() => navigate('/assignments')}
                    >
                        <FiArrowLeft className="me-2" />
                        Back to Assignments
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-gray-100"
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
                        <p className="text-gray-600">{assignment.description}</p>
                    </div>
                    <Button 
                        variant="outline-primary" 
                        className="rounded-xl px-4 py-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200"
                        onClick={() => navigate('/assignments')}
                    >
                        <FiArrowLeft className="me-2" />
                        Back
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <div className="flex items-center text-gray-600">
                            <FiCalendar className="mr-3 text-blue-500" />
                            <span>Due Date: {formatDate(assignment.dueDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <FiFileText className="mr-3 text-blue-500" />
                            <span>Total Questions: {assignment.questions.length}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <FiCheckCircle className="mr-3 text-blue-500" />
                            <span>Total Marks: {assignment.totalMarks}</span>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
                    <div className="bg-gray-50 rounded-xl p-4 text-gray-700">
                        {assignment.instructions}
                    </div>
                </div>

                {assignment.attachments && assignment.attachments.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Attachments</h2>
                        <div className="space-y-2">
                            {assignment.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center">
                                        <FiFileText className="mr-3 text-blue-500" />
                                        <span className="text-gray-700">{attachment.name}</span>
                                    </div>
                                    <Button
                                        variant="link"
                                        className="text-blue-600 hover:text-blue-700 p-0"
                                        onClick={() => window.open(`${BASE_URL}${attachment.url}`, '_blank')}
                                    >
                                        <FiDownload className="mr-2" />
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {submitSuccess && !existingSubmission && (
                    <Alert variant="success" className="mb-4">
                        <div className="flex items-center">
                            <div>
                                <h4 className="text-lg font-semibold">Assignment Submitted Successfully!</h4>
                                <p className="mb-0">Your assignment has been submitted and evaluated.</p>
                            </div>
                        </div>
                    </Alert>
                )}

                {evaluationResult && (
                    <div className="mb-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Evaluation Results</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-600">Score:</span>
                                    <span className="text-2xl font-bold text-blue-600">{evaluationResult.scaledScore}/{assignment?.totalMarks}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                    <div 
                                        className="bg-blue-600 h-2.5 rounded-full" 
                                        style={{ width: `${evaluationResult.percentage}%` }}
                                    ></div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {evaluationResult.earned} out of {evaluationResult.total} questions correct ({evaluationResult.percentage}%)
                                </div>
                            </div>
                            {existingSubmission?.feedback && (
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                                    <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
                                        {typeof existingSubmission.feedback === 'string' && 
                                          existingSubmission.feedback.split('\n').map((line, index) => (
                                            <div key={index} className="mb-1">{line}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {existingSubmission && (
                    <div className="sticky top-0 z-10 mt-6 bg-green-100 rounded-xl p-4 border-2 border-green-300 shadow-md mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FiCheckCircle className="text-green-600 text-2xl mr-3" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Assignment Successfully Submitted</h3>
                                    <p className="text-sm text-gray-600">Your answers have been recorded</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                                {formatDate(existingSubmission.submittedAt)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Evaluation Results Section - Enhanced with Graded Result */}
                {gradedResult && (
                    <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Results</h3>
                        
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600">Your Score:</span>
                                <span className="text-2xl font-bold text-green-600">
                                    {gradedResult.earnedMarks}/{gradedResult.totalMarks}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                    className="bg-green-600 h-2.5 rounded-full" 
                                    style={{ width: `${gradedResult.percentage}%` }}
                                ></div>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                <p>Percentage: {gradedResult.percentage}%</p>
                                <p>Scaled Score: {gradedResult.scaledScore}/{assignment?.totalMarks}</p>
                                {gradedResult.certificateIssued && (
                                    <p className="text-green-600 font-medium mt-2 flex items-center">
                                        <FiCheckCircle className="mr-2" />
                                        Certificate Issued
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        {gradedResult.overallFeedback && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                                <p className="text-sm text-gray-700">{gradedResult.overallFeedback}</p>
                            </div>
                        )}
                        
                        {gradedResult.comments && (
                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                <h4 className="font-medium text-gray-900 mb-2">Instructor Comments</h4>
                                <p className="text-sm text-gray-700">{gradedResult.comments}</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {existingSubmission ? 'Your Submitted Answers' : 'Questions'}
                    </h2>
                    <div className="space-y-4">
                        {assignment?.questions.map((question, index) => {
                            // Check if this question has been answered
                            const isAnswered = answers[index]?.answer && answers[index].answer.trim() !== '';
                            const questionClassName = isAnswered ? 'question-answered' : 'bg-gray-50';
                            
                            return (
                                <div key={index} className={`rounded-xl p-4 ${questionClassName}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-gray-900">
                                            Question {index + 1}: {question.text}
                                        </h3>
                                        {existingSubmission ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                Submitted
                                            </span>
                                        ) : isAnswered ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                Answered
                                            </span>
                                        ) : null}
                                    </div>
                                    
                                    {existingSubmission ? (
                                        <div className="mt-2">
                                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                <p className="text-sm text-blue-700 font-medium mb-1">Your submitted answer:</p>
                                                <p className="text-gray-800">{existingSubmission.answers[index]?.answer || 'No answer provided'}</p>
                                            </div>
                                            {existingSubmission.answers[index]?.feedback && (
                                                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <p className="text-sm text-gray-700 font-medium mb-1">Feedback:</p>
                                                    <p className="text-gray-600">{existingSubmission.answers[index].feedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {question.type === 'multiple-choice' && question.options && (
                                                <div className="ml-4 space-y-2">
                                                    {question.options.map((option, optionIndex) => (
                                                        <Form.Check
                                                            key={optionIndex}
                                                            type="radio"
                                                            id={`question-${index}-option-${optionIndex}`}
                                                            label={option}
                                                            name={`question-${index}`}
                                                            checked={answers[index]?.answer === option}
                                                            onChange={(e) => handleAnswerChange(index, option)}
                                                            className="answer-input"
                                                            disabled={existingSubmission !== null}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {(question.type === 'short-answer' || question.type === 'long-answer') && (
                                                <Form.Control
                                                    as={question.type === 'short-answer' ? 'input' : 'textarea'}
                                                    rows={question.type === 'short-answer' ? 2 : 6}
                                                    placeholder={
                                                        question.type === 'short-answer' 
                                                            ? 'Enter your answer (1-2 sentences)' 
                                                            : 'Enter your detailed answer'
                                                    }
                                                    value={answers[index]?.answer || ''}
                                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                    className="mt-2 answer-input w-full h-full"
                                                    disabled={existingSubmission !== null}
                                                    style={{
                                                        resize: 'vertical',
                                                        minHeight: '150px',
                                                        maxHeight: '300px'
                                                    }}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {existingSubmission ? (
                    <Alert variant="info" className="mb-4">
                        <h4 className="alert-heading">Assignment Already Submitted</h4>
                    </Alert>
                ) : submitError ? (
                    <Alert variant="danger" className="mb-4">
                        {submitError}
                    </Alert>
                ) : null}

                {/* Only show submit button if there's no existing submission */}
                {!existingSubmission && (
                    <div className="mt-6">
                        {renderSavedIndicator()}
                        <Button
                            variant="primary"
                            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <FiSend className="mr-2" />
                                    Submit Assignment
                                </div>
                            )}
                        </Button>
                        {isProgress && (
                            <p className="text-center text-sm text-gray-600 mt-2">
                                Your progress is saved automatically. You can return to this page later.
                            </p>
                        )}
                    </div>
                )}

                {/* Show submitted button if there's an existing submission */}
                {existingSubmission && (
                    <div className="mt-6">
                        <Button
                            variant="success"
                            className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 transition-all duration-200 shadow-md"
                            disabled
                        >
                            <div className="flex items-center justify-center">
                                <FiCheckCircle className="mr-2 text-lg" />
                                Assignment Submitted
                            </div>
                        </Button>
                        <p className="text-center text-sm text-gray-600 mt-2">
                            Your assignment has been successfully submitted and is awaiting grading
                        </p>
                    </div>
                )}
            </motion.div>
        </Container>
    );
}