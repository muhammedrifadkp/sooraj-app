import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiX, FiFileText, FiCalendar, FiBook, FiAward, FiInfo, FiUsers } from 'react-icons/fi';
import assignmentService from '../../services/assignmentService';
import courseService from '../../services/courseService';
import { Assignment } from '../../types/assignment';
import { Course } from '../../types/course';

const EditAssignment: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentData, coursesData] = await Promise.all([
        assignmentService.getAssignmentById(id || ''),
        courseService.getAllCourses()
      ]);
      setAssignment(assignmentData);
      setCourses(coursesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!assignment) return;
    setAssignment(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment) return;

    try {
      setSaving(true);
      setError(null);

      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('title', assignment.title);
      formDataToSend.append('description', assignment.description);
      formDataToSend.append('course', typeof assignment.course === 'string' ? assignment.course : assignment.course._id);
      formDataToSend.append('department', assignment.department);
      formDataToSend.append('dueDate', assignment.dueDate);
      formDataToSend.append('totalMarks', assignment.totalMarks.toString());
      formDataToSend.append('instructions', assignment.instructions);
      
      // Add questions
      formDataToSend.append('questions', JSON.stringify(assignment.questions));

      console.log('Updating assignment with form data:', Object.fromEntries(formDataToSend.entries()));
      await assignmentService.updateAssignment(assignment._id, formDataToSend);
      navigate('/admin/assignments');
    } catch (err) {
      console.error('Error updating assignment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update assignment');
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
        <p className="mt-3 text-gray-600 font-medium">Loading assignment...</p>
      </Container>
    );
  }

  if (error) {
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
                <p className="mb-0">{error}</p>
              </div>
            </div>
          </Alert>
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline-primary" 
              className="rounded-xl px-5 py-2.5 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
              onClick={() => navigate('/admin/assignments')}
            >
              <FiArrowLeft className="me-2" />
              Back to Assignments
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  if (!assignment) {
    return (
      <Container className="py-5">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-gray-100">
          <Alert variant="warning" className="border-0 bg-yellow-50 text-yellow-700 rounded-xl">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FiInfo className="text-yellow-500 text-xl" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Assignment Not Found</h4>
                <p className="mb-0">The assignment you're looking for doesn't exist or has been removed.</p>
              </div>
            </div>
          </Alert>
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline-primary" 
              className="rounded-xl px-5 py-2.5 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
              onClick={() => navigate('/admin/assignments')}
            >
              <FiArrowLeft className="me-2" />
              Back to Assignments
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
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Assignment</h1>
            <p className="text-gray-500 mt-0.5">Update assignment information</p>
          </div>
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/admin/assignments')}
            className="rounded-xl px-4 py-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium w-full sm:w-auto"
          >
            <FiArrowLeft className="me-2" />
            Back to Assignments
          </Button>
        </div>

        <Form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-3 sm:p-4 md:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                <div className="col-span-1">
                  <Form.Group className="mb-3 sm:mb-4">
                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                        <FiFileText className="text-indigo-500" />
                      </div>
                      Assignment Title
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={assignment.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2"
                    />
                  </Form.Group>
                </div>

                <div className="col-span-1">
                  <Form.Group className="mb-3 sm:mb-4">
                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                        <FiBook className="text-indigo-500" />
                      </div>
                      Course
                    </Form.Label>
                    <Form.Select
                      value={typeof assignment.course === 'string' ? assignment.course : assignment.course._id}
                      onChange={(e) => handleInputChange('course', e.target.value)}
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

                <div className="col-span-1">
                  <Form.Group className="mb-3 sm:mb-4">
                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                        <FiUsers className="text-indigo-500" />
                      </div>
                      Department
                    </Form.Label>
                    <Form.Select
                      value={assignment.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      required
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2"
                    >
                      <option value="CSE">Computer Science Engineering (CSE)</option>
                      <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
                      <option value="MECH">Mechanical Engineering (MECH)</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-span-1">
                  <Form.Group className="mb-3 sm:mb-4">
                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                        <FiCalendar className="text-indigo-500" />
                      </div>
                      Due Date
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={new Date(assignment.dueDate).toISOString().slice(0, 16)}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      required
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2"
                    />
                  </Form.Group>
                </div>

                <div className="col-span-1">
                  <Form.Group className="mb-3 sm:mb-4">
                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                        <FiAward className="text-indigo-500" />
                      </div>
                      Total Marks
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={assignment.totalMarks}
                      onChange={(e) => handleInputChange('totalMarks', e.target.value)}
                      required
                      min="1"
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2"
                    />
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
                      rows={4}
                      value={assignment.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </Form.Group>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Form.Group className="mb-3 sm:mb-4">
                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                        <FiInfo className="text-indigo-500" />
                      </div>
                      Instructions
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={assignment.instructions}
                      onChange={(e) => handleInputChange('instructions', e.target.value)}
                      required
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </Form.Group>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Form.Group className="mb-3 sm:mb-4">
                    <Form.Label className="text-gray-700 font-medium flex items-center mb-1.5">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 rounded-lg mr-2">
                        <FiFileText className="text-indigo-500" />
                      </div>
                      Questions
                    </Form.Label>
                    <div className="space-y-4">
                      {assignment.questions.map((question, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Question {index + 1}</h3>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Form.Label className="text-gray-700 font-medium mb-1.5">
                                Question Text
                              </Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={2}
                                value={question.text}
                                onChange={(e) => {
                                  const newQuestions = [...assignment.questions];
                                  newQuestions[index] = { ...newQuestions[index], text: e.target.value };
                                  setAssignment({ ...assignment, questions: newQuestions });
                                }}
                                required
                                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <Form.Label className="text-gray-700 font-medium mb-1.5">
                                Question Type
                              </Form.Label>
                              <Form.Select
                                value={question.type}
                                onChange={(e) => {
                                  const newQuestions = [...assignment.questions];
                                  newQuestions[index] = { 
                                    ...newQuestions[index], 
                                    type: e.target.value as 'multiple-choice' | 'short-answer' | 'essay',
                                    options: e.target.value === 'multiple-choice' ? ['', '', '', ''] : undefined,
                                    correctAnswer: e.target.value === 'multiple-choice' ? '' : undefined
                                  };
                                  setAssignment({ ...assignment, questions: newQuestions });
                                }}
                                required
                                className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2"
                              >
                                <option value="multiple-choice">Multiple Choice</option>
                                <option value="short-answer">Short Answer</option>
                                <option value="essay">Essay</option>
                              </Form.Select>
                            </div>

                            {question.type === 'multiple-choice' && (
                              <div className="space-y-2">
                                <Form.Label className="text-gray-700 font-medium mb-1.5">
                                  Options
                                </Form.Label>
                                {question.options?.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center space-x-2">
                                    <Form.Control
                                      type="text"
                                      value={option}
                                      onChange={(e) => {
                                        const newQuestions = [...assignment.questions];
                                        const newOptions = [...(newQuestions[index].options || [])];
                                        newOptions[optionIndex] = e.target.value;
                                        newQuestions[index] = { ...newQuestions[index], options: newOptions };
                                        setAssignment({ ...assignment, questions: newQuestions });
                                      }}
                                      required
                                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                      placeholder={`Option ${optionIndex + 1}`}
                                    />
                                    <input
                                      type="radio"
                                      name={`correct-${index}`}
                                      checked={question.correctAnswer === option}
                                      onChange={() => {
                                        const newQuestions = [...assignment.questions];
                                        newQuestions[index] = { ...newQuestions[index], correctAnswer: option };
                                        setAssignment({ ...assignment, questions: newQuestions });
                                      }}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {question.type !== 'multiple-choice' && (
                              <div>
                                <Form.Label className="text-gray-700 font-medium mb-1.5">
                                  Correct Answer
                                </Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  value={question.correctAnswer || ''}
                                  onChange={(e) => {
                                    const newQuestions = [...assignment.questions];
                                    newQuestions[index] = { ...newQuestions[index], correctAnswer: e.target.value };
                                    setAssignment({ ...assignment, questions: newQuestions });
                                  }}
                                  className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Form.Group>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
          </div>
        </Form>
      </motion.div>
    </Container>
  );
};

export default EditAssignment; 