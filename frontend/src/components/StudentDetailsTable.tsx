import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiUser, FiBook, FiFileText, FiCalendar, FiCheckCircle, FiXCircle, FiUsers, FiAlertCircle, FiPlus, FiMinus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Student {
  _id: string;
  name: string;
  email: string;
  department: 'CSE' | 'EEE' | 'MECH';
  assignments: {
    submitted: number;
    total: number;
    averageScore: number;
  };
  attendance: {
    present: number;
    total: number;
    percentage: number;
    liveClassIds?: string[];
  };
  courses: {
    enrolled: number;
    completed: number;
  };
}

const StudentDetailsTable: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const { user } = useAuth();
  const [updating, setUpdating] = useState<string>(''); // studentId being updated

  // Helper to check if current user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching students from API...');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/students`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('API Response:', response.data);
      // Ensure response.data is an array
      const studentData = Array.isArray(response.data) ? response.data : [];
      console.log('Processed student data:', studentData);
      setStudents(studentData);
    } catch (err) {
      console.error('Error loading students:', err);
      if (axios.isAxiosError(err)) {
        console.error('API Error:', err.response?.data);
        setError(err.response?.data?.message || 'Failed to load student data');
      } else {
        setError('Failed to load student data');
      }
      setStudents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceUpdate = async (studentId: string, action: 'increase' | 'decrease') => {
    setUpdating(studentId);
    try {
      // Find the liveClassId to update (latest class for demo)
      const student = students.find(s => s._id === studentId);
      if (!student || !student.attendance.liveClassIds?.length) {
        alert('No live class found for this student');
        setUpdating('');
        return;
      }
      const liveClassId = student.attendance.liveClassIds[0]; // or allow admin to pick
      await axios.post(`${import.meta.env.VITE_API_URL}/attendance/admin/update-present`, {
        userId: studentId,
        liveClassId,
        action
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      await loadStudents();
    } catch (err) {
      alert('Failed to update attendance');
    } finally {
      setUpdating('');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || student.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

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
        <button
          onClick={loadStudents}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-lg mr-3">
              <FiUsers className="text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Student Details</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
            >
              <option value="all">All Departments</option>
              <option value="CSE">Computer Science Engineering (CSE)</option>
              <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
              <option value="MECH">Mechanical Engineering (MECH)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignments
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Courses
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <motion.tr
                key={student._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                        <FiUser className="text-indigo-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getDepartmentColor(student.department)}`}>
                    {student.department}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.assignments.total > 0 ? (
                    <>
                      <div className="text-sm text-gray-900">
                        {student.assignments.submitted}/{student.assignments.total} submitted
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg. Score: {student.assignments.averageScore}%
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <FiAlertCircle className="mr-1.5" />
                      <span className="text-sm">No assignments available</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.attendance.total > 0 ? (
                    <>
                      <div className="text-sm text-gray-900">
                        {student.attendance.present}/{student.attendance.total} classes
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.attendance.percentage}% attendance
                      </div>
                      {isAdmin && student.attendance.liveClassIds && student.attendance.liveClassIds.length > 0 && (
                        <div className="flex space-x-2 mt-2">
                          <button
                            className="inline-flex items-center px-2 py-1 border border-green-500 text-green-700 bg-green-50 rounded hover:bg-green-100 disabled:opacity-50"
                            title="Increase Present"
                            onClick={() => handleAttendanceUpdate(student._id, 'increase')}
                            disabled={updating === student._id}
                          >
                            <FiPlus />
                          </button>
                          <button
                            className="inline-flex items-center px-2 py-1 border border-red-500 text-red-700 bg-red-50 rounded hover:bg-red-100 disabled:opacity-50"
                            title="Decrease Present"
                            onClick={() => handleAttendanceUpdate(student._id, 'decrease')}
                            disabled={updating === student._id}
                          >
                            <FiMinus />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <FiAlertCircle className="mr-1.5" />
                      <span className="text-sm">No classes available</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.courses.enrolled > 0 ? (
                    <>
                      <div className="text-sm text-gray-900">
                        {student.courses.enrolled} enrolled
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.courses.completed} completed
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <FiAlertCircle className="mr-1.5" />
                      <span className="text-sm">No courses available</span>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No students found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentDetailsTable; 