import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Container, Form, Alert, Spinner } from 'react-bootstrap';
import { FiCheckCircle, FiClock, FiFileText, FiArrowRight } from 'react-icons/fi';
import assignmentService from '../services/assignmentService';
import { Assignment } from '../types/assignment';
import { useAuth } from '../context/AuthContext';

export default function AssignmentView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answers, setAnswers] = useState<any[]>([]);
    const [submission, setSubmission] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadAssignment();
    }, [id]);

    const loadAssignment = async () => {
        try {
            setLoading(true);
            const data = await assignmentService.getAssignmentById(id || '');
            setAssignment(data);
            
            // Initialize answers array with empty values
            if (data) {
                setAnswers(data.questions.map(q => ({
                    questionId: q._id || q.id,
                    answer: ''
                })));
            }
        } catch (error) {
            console.error('Error loading assignment:', error);
            setError('Failed to load assignment');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (assignment && user) {
            const userSubmission = assignment.submissions?.find(
                s => s.student === user._id
            );
            setSubmission(userSubmission);
        }
    }, [assignment, user]);

    const handleAnswerChange = (index: number, value: string) => {
        setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[index] = {
                ...newAnswers[index],
                answer: value
            };
            return newAnswers;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignment || isSubmitting) return;

        try {
            setIsSubmitting(true);
            
            // Validate all required fields are filled
            const hasEmptyAnswers = answers.some(a => !a.answer.trim());
            if (hasEmptyAnswers) {
                throw new Error('Please answer all questions');
            }

            await assignmentService.submitAssignment(assignment._id, answers);
            
            // Update submission status
            setSubmission({
                student: user?._id,
                answers: answers,
                submittedAt: new Date().toISOString(),
                evaluation: {
                    status: 'pending',
                    totalMarks: assignment.totalMarks,
                    earnedMarks: 0
                }
            });

            toast.success('Assignment submitted successfully');
            navigate('/assignments');
        } catch (error) {
            console.error('Error submitting assignment:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to submit assignment');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-8">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-8">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!assignment) {
        return <div>Assignment not found</div>;
    }

    return (
        <Container className="py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h2>
                            <p className="text-sm text-gray-500">
                                {typeof assignment.course === 'string' 
                                    ? assignment.course 
                                    : assignment.course.title}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <div className="flex items-center text-gray-600">
                                <FiCalendar className="mr-2" />
                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                            <p className="text-gray-600">{assignment.description}</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
                            <p className="text-gray-600">{assignment.instructions}</p>
                        </div>

                        {assignment.attachments?.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                                <div className="space-y-2">
                                    {assignment.attachments.map((attachment, index) => (
                                        <a
                                            key={index}
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-blue-600 hover:text-blue-800"
                                        >
                                            <FiFileText className="mr-2" />
                                            {attachment.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
                            {assignment.questions.map((question, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-4">
                                    <div className="space-y-2">
                                        <h4 className="text-gray-800 font-medium">{index + 1}. {question.text}</h4>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <span className="mr-2">Type: {question.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                            <span className="ml-2">Marks: {question.marks}</span>
                                        </div>
                                    </div>

                                    {question.type === 'multiple-choice' ? (
                                        <div className="space-y-2">
                                            {question.options?.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name={`question-${index}`}
                                                        value={option}
                                                        checked={answers[index]?.answer === option}
                                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                        className="mr-2"
                                                    />
                                                    <label className="text-gray-700">{option}</label>
                                                </div>
                                            ))}
                                        </div>
                                    ) : question.type === 'true-false' ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`question-${index}`}
                                                    value="true"
                                                    checked={answers[index]?.answer === 'true'}
                                                    onChange={(e) => handleAnswerChange(index, 'true')}
                                                    className="mr-2"
                                                />
                                                <label className="text-gray-700">True</label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`question-${index}`}
                                                    value="false"
                                                    checked={answers[index]?.answer === 'false'}
                                                    onChange={(e) => handleAnswerChange(index, 'false')}
                                                    className="mr-2"
                                                />
                                                <label className="text-gray-700">False</label>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Form.Group controlId={`question-${index}`}>
                                                <Form.Label>Answer</Form.Label>
                                                <Form.Control
                                                    as={question.type === 'short-answer' ? 'input' : 'textarea'}
                                                    rows={question.type === 'short-answer' ? 2 : 4}
                                                    value={answers[index]?.answer || ''}
                                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                    required
                                                    placeholder={
                                                        question.type === 'short-answer' 
                                                            ? 'Enter your answer (1-2 sentences)' 
                                                            : 'Enter your detailed answer'
                                                    }
                                                />
                                            </Form.Group>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            {submission ? (
                                <div className="flex items-center text-green-600 font-medium">
                                    <FiCheckCircle className="mr-2" />
                                    <span>Assignment submitted successfully</span>
                                </div>
                            ) : (
                                <Button
                                    variant="primary"
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="mr-2"
                                            />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Assignment'
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </Container>
    );
}
