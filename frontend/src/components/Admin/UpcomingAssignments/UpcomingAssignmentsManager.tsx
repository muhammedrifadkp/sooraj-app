import React, { useState, useEffect } from 'react';
import { FaTasks, FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { assignmentAPI, courseAPI } from '../../../services/api';
import styles from './UpcomingAssignmentsManager.module.css';
import { toast } from 'react-hot-toast';

interface Assignment {
  _id: string;
  title: string;
  course: string | { _id: string; title: string };
  dueDate: string;
  status: string;
  department: string;
  description: string;
  totalMarks: number;
  instructions: string;
}

interface Course {
  _id: string;
  title: string;
}

const UpcomingAssignmentsManager: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    dueDate: '',
    department: 'CSE',
    description: '',
    totalMarks: 100,
    instructions: '',
  });
  const [formErrors, setFormErrors] = useState({
    title: '',
    course: '',
    dueDate: '',
    description: '',
    totalMarks: '',
    instructions: '',
  });
  
  // Fetch assignments and courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch assignments
        const assignmentsResponse = await assignmentAPI.getAssignments();
        
        // Fetch courses for dropdown
        const coursesResponse = await courseAPI.getAllCourses();
        
        // Process assignments to include course title
        const processedAssignments = assignmentsResponse.map((assignment: any) => ({
          ...assignment,
          status: getAssignmentStatus(assignment.dueDate)
        }));
        
        setAssignments(processedAssignments);
        setFilteredAssignments(processedAssignments);
        setCourses(coursesResponse);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
        toast.error('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter assignments when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAssignments(assignments);
    } else {
      const filtered = assignments.filter(
        assignment => 
          assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof assignment.course === 'object' && assignment.course.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredAssignments(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, assignments]);
  
  // Get assignment status based on due date
  const getAssignmentStatus = (dueDate: string): string => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now) {
      return 'completed';
    } else {
      return 'pending';
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors = {
      title: '',
      course: '',
      dueDate: '',
      description: '',
      totalMarks: '',
      instructions: '',
    };
    
    let isValid = true;
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }
    
    if (!formData.course) {
      errors.course = 'Course is required';
      isValid = false;
    }
    
    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required';
      isValid = false;
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    }
    
    if (!formData.totalMarks || formData.totalMarks <= 0) {
      errors.totalMarks = 'Total marks must be greater than 0';
      isValid = false;
    }
    
    if (!formData.instructions.trim()) {
      errors.instructions = 'Instructions are required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Open modal for adding new assignment
  const handleAddAssignment = () => {
    setModalMode('add');
    setCurrentAssignment(null);
    setFormData({
      title: '',
      course: '',
      dueDate: '',
      department: 'CSE',
      description: '',
      totalMarks: 100,
      instructions: '',
    });
    setFormErrors({
      title: '',
      course: '',
      dueDate: '',
      description: '',
      totalMarks: '',
      instructions: '',
    });
    setIsModalOpen(true);
  };
  
  // Open modal for editing assignment
  const handleEditAssignment = (assignment: Assignment) => {
    setModalMode('edit');
    setCurrentAssignment(assignment);
    
    // Format date for input field (YYYY-MM-DD)
    const dueDate = new Date(assignment.dueDate);
    const formattedDate = dueDate.toISOString().split('T')[0];
    
    setFormData({
      title: assignment.title,
      course: typeof assignment.course === 'object' ? assignment.course._id : assignment.course,
      dueDate: formattedDate,
      department: assignment.department,
      description: assignment.description,
      totalMarks: assignment.totalMarks,
      instructions: assignment.instructions,
    });
    
    setFormErrors({
      title: '',
      course: '',
      dueDate: '',
      description: '',
      totalMarks: '',
      instructions: '',
    });
    
    setIsModalOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (modalMode === 'add') {
        // Create new assignment
        const formDataObj = new FormData();
        formDataObj.append('title', formData.title);
        formDataObj.append('course', formData.course);
        formDataObj.append('dueDate', formData.dueDate);
        formDataObj.append('department', formData.department);
        formDataObj.append('description', formData.description);
        formDataObj.append('totalMarks', formData.totalMarks.toString());
        formDataObj.append('instructions', formData.instructions);
        
        // Add empty questions array
        formDataObj.append('questions', JSON.stringify([]));
        
        const newAssignment = await assignmentAPI.createAssignment(formDataObj);
        
        // Find course title
        const course = courses.find(c => c._id === formData.course);
        
        // Add to assignments list
        setAssignments(prev => [
          ...prev, 
          {
            ...newAssignment,
            course: { _id: formData.course, title: course?.title || 'Unknown Course' },
            status: getAssignmentStatus(formData.dueDate)
          }
        ]);
        
        toast.success('Assignment created successfully');
      } else if (modalMode === 'edit' && currentAssignment) {
        // Update existing assignment
        const formDataObj = new FormData();
        formDataObj.append('title', formData.title);
        formDataObj.append('course', formData.course);
        formDataObj.append('dueDate', formData.dueDate);
        formDataObj.append('department', formData.department);
        formDataObj.append('description', formData.description);
        formDataObj.append('totalMarks', formData.totalMarks.toString());
        formDataObj.append('instructions', formData.instructions);
        
        const updatedAssignment = await assignmentAPI.updateAssignment(currentAssignment._id, formDataObj);
        
        // Find course title
        const course = courses.find(c => c._id === formData.course);
        
        // Update assignments list
        setAssignments(prev => 
          prev.map(assignment => 
            assignment._id === currentAssignment._id 
              ? {
                  ...updatedAssignment,
                  course: { _id: formData.course, title: course?.title || 'Unknown Course' },
                  status: getAssignmentStatus(formData.dueDate)
                }
              : assignment
          )
        );
        
        toast.success('Assignment updated successfully');
      }
      
      // Close modal
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save assignment');
    }
  };
  
  // Handle assignment deletion
  const handleDeleteAssignment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await assignmentAPI.deleteAssignment(id);
        setAssignments(prev => prev.filter(assignment => assignment._id !== id));
        toast.success('Assignment deleted successfully');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete assignment');
      }
    }
  };
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <FaTasks className={styles.titleIcon} /> Upcoming Assignments
          </h2>
        </div>
        <div className="text-center py-4">Loading assignments...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <FaTasks className={styles.titleIcon} /> Upcoming Assignments
          </h2>
        </div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FaTasks className={styles.titleIcon} /> Upcoming Assignments
        </h2>
        <button className={styles.addButton} onClick={handleAddAssignment}>
          <FaPlus /> Add Assignment
        </button>
      </div>
      
      <div className={styles.searchContainer}>
        <div style={{ position: 'relative' }}>
          <FaSearch className={styles.searchIcon} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
      </div>
      
      {currentItems.length === 0 ? (
        <div className={styles.emptyState}>
          <FaTasks className={styles.emptyStateIcon} />
          <p className={styles.emptyStateText}>No assignments found</p>
          <button className={styles.addButton} onClick={handleAddAssignment}>
            <FaPlus /> Add Assignment
          </button>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Course</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((assignment) => (
                  <tr key={assignment._id}>
                    <td>{assignment.title}</td>
                    <td>{typeof assignment.course === 'object' ? assignment.course.title : assignment.course}</td>
                    <td>{formatDate(assignment.dueDate)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`status${assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}`]}`}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button 
                          className={`${styles.actionButton} ${styles.viewButton}`}
                          title="View Assignment"
                          onClick={() => window.open(`/assignments/${assignment._id}`, '_blank')}
                        >
                          <FaEye />
                        </button>
                        <button 
                          className={`${styles.actionButton} ${styles.editButton}`}
                          title="Edit Assignment"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Delete Assignment"
                          onClick={() => handleDeleteAssignment(assignment._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                className={styles.paginationButton}
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  className={`${styles.paginationButton} ${currentPage === number ? styles.paginationActive : ''}`}
                  onClick={() => paginate(number)}
                >
                  {number}
                </button>
              ))}
              
              <button 
                className={styles.paginationButton}
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Assignment Modal */}
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modalMode === 'add' ? 'Add New Assignment' : 'Edit Assignment'}
              </h3>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.formLabel}>Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
                {formErrors.title && <p className={styles.errorText}>{formErrors.title}</p>}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="course" className={styles.formLabel}>Course</label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                {formErrors.course && <p className={styles.errorText}>{formErrors.course}</p>}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="dueDate" className={styles.formLabel}>Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className={styles.formInput}
                />
                {formErrors.dueDate && <p className={styles.errorText}>{formErrors.dueDate}</p>}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="department" className={styles.formLabel}>Department</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="CSE">Computer Science Engineering (CSE)</option>
                  <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
                  <option value="MECH">Mechanical Engineering (MECH)</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="description" className={styles.formLabel}>Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                />
                {formErrors.description && <p className={styles.errorText}>{formErrors.description}</p>}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="totalMarks" className={styles.formLabel}>Total Marks</label>
                <input
                  type="number"
                  id="totalMarks"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className={styles.formInput}
                />
                {formErrors.totalMarks && <p className={styles.errorText}>{formErrors.totalMarks}</p>}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="instructions" className={styles.formLabel}>Instructions</label>
                <textarea
                  id="instructions"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                />
                {formErrors.instructions && <p className={styles.errorText}>{formErrors.instructions}</p>}
              </div>
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton}>
                  {modalMode === 'add' ? 'Create Assignment' : 'Update Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingAssignmentsManager;
