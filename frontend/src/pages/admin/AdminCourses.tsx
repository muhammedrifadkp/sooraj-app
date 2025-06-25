import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiBook, FiFilter } from 'react-icons/fi';
import courseService from '../../services/courseService';
import { Course } from '../../types/course';
import SafeDisplay from '../../components/SafeDisplay';

const AdminCourses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedDepartment === 'all') {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(courses.filter(course => course.department === selectedDepartment));
    }
  }, [selectedDepartment, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
      setFilteredCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely get instructor name
  const getInstructorName = (instructor: any): string => {
    if (!instructor) return 'Unknown';
    
    if (typeof instructor === 'object' && instructor !== null) {
      return instructor.name || 'Unknown';
    }
    
    return typeof instructor === 'string' ? instructor : 'Unknown';
  };

  const handleEdit = (courseId: string) => {
    navigate(`/admin/edit-course/${courseId}`);
  };

  const handleDelete = async (courseId: string) => {
    try {
      await courseService.deleteCourse(courseId);
      setCourses(courses.filter(course => course._id !== courseId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course');
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'CSE':
        return 'bg-blue-100 text-blue-800';
      case 'EEE':
        return 'bg-purple-100 text-purple-800';
      case 'MECH':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
        <button
          onClick={() => navigate('/admin/add-course')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
        >
          <FiPlus className="mr-2" /> Add New Course
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-lg mr-3">
              <FiFilter className="text-indigo-500" />
            </div>
            <label htmlFor="department-filter" className="text-sm font-medium text-gray-700 mr-2">
              Filter by Department:
            </label>
            <select
              id="department-filter"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
            >
              <option value="all">All Departments</option>
              <option value="CSE">Computer Science Engineering (CSE)</option>
              <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
              <option value="MECH">Mechanical Engineering (MECH)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBook className="text-indigo-500 text-3xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No courses found</h3>
              <p className="mt-2 text-sm text-gray-500">Get started by creating a new course.</p>
              <button
                onClick={() => navigate('/admin/add-course')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                <FiPlus className="mr-2" /> Add your first course
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm flex items-center justify-center border border-gray-100">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={<SafeDisplay value={course.title} defaultValue="Course" /> as any}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FiBook className="text-indigo-500 text-xl" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        <SafeDisplay value={course.title} defaultValue="Untitled Course" />
                      </h3>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getDepartmentColor(course.department || '')}`}>
                          <SafeDisplay value={course.department} defaultValue="N/A" />
                        </span>

                        <span className="text-sm text-gray-500">
                          Instructor: <SafeDisplay value={getInstructorName(course.instructor)} defaultValue="Unknown" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(course._id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Edit course"
                    >
                      <FiEdit2 className="w-4 h-4 mr-1.5" />
                      Edit
                    </button>
                    {deleteConfirmId === course._id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(course._id)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Delete course"
                      >
                        <FiTrash2 className="w-4 h-4 mr-1.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminCourses; 