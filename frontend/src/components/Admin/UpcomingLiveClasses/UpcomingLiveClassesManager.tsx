import React, { useState, useEffect } from 'react';
import { FaVideo, FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaChevronLeft, FaChevronRight, FaLink } from 'react-icons/fa';
import { liveClassAPI, courseAPI } from '../../../services/api';
import styles from './UpcomingLiveClassesManager.module.css';
import { toast } from 'react-hot-toast';

interface LiveClass {
  _id: string;
  title: string;
  description: string;
  course: string | { _id: string; title: string };
  instructor: string | { _id: string; name: string };
  startTime: string;
  endTime: string;
  meetingLink: string;
  status: string;
  department: string;
  maxParticipants: number;
}

interface Course {
  _id: string;
  title: string;
}

const UpcomingLiveClassesManager: React.FC = () => {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [filteredLiveClasses, setFilteredLiveClasses] = useState<LiveClass[]>([]);
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
  const [currentLiveClass, setCurrentLiveClass] = useState<LiveClass | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    department: 'CSE',
    startTime: '',
    endTime: '',
    meetingLink: '',
    maxParticipants: 50,
    status: 'scheduled'
  });

  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    course: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
    maxParticipants: ''
  });

  // Fetch live classes and courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch live classes
        const liveClassesResponse = await liveClassAPI.getAllLiveClasses();

        // Fetch courses for dropdown
        const coursesResponse = await courseAPI.getAllCourses();

        // Process live classes to include course title and instructor name
        const processedLiveClasses = liveClassesResponse.map((liveClass: any) => ({
          ...liveClass,
          status: getLiveClassStatus(liveClass.startTime, liveClass.endTime, liveClass.status)
        }));

        setLiveClasses(processedLiveClasses);
        setFilteredLiveClasses(processedLiveClasses);
        setCourses(coursesResponse);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
        toast.error('Failed to load live classes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter live classes when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLiveClasses(liveClasses);
    } else {
      const filtered = liveClasses.filter(
        liveClass =>
          liveClass.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof liveClass.course === 'object' && liveClass.course.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (typeof liveClass.instructor === 'object' && liveClass.instructor.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredLiveClasses(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, liveClasses]);

  // Get live class status based on start and end times
  const getLiveClassStatus = (startTime: string, endTime: string, currentStatus: string): string => {
    if (currentStatus === 'cancelled') {
      return 'cancelled';
    }

    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return 'scheduled';
    } else if (now >= start && now <= end) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  };

  // Format date and time for display
  const formatDateTime = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
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
      description: '',
      course: '',
      startTime: '',
      endTime: '',
      meetingLink: '',
      maxParticipants: ''
    };

    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    }

    if (!formData.course) {
      errors.course = 'Course is required';
      isValid = false;
    }

    if (!formData.startTime) {
      errors.startTime = 'Start time is required';
      isValid = false;
    }

    if (!formData.endTime) {
      errors.endTime = 'End time is required';
      isValid = false;
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);

      if (end <= start) {
        errors.endTime = 'End time must be after start time';
        isValid = false;
      }
    }

    if (!formData.meetingLink.trim()) {
      errors.meetingLink = 'Meeting link is required';
      isValid = false;
    } else if (!isValidUrl(formData.meetingLink)) {
      errors.meetingLink = 'Please enter a valid URL';
      isValid = false;
    }

    if (!formData.maxParticipants || formData.maxParticipants <= 0) {
      errors.maxParticipants = 'Maximum participants must be greater than 0';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Validate URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Open modal for adding new live class
  const handleAddLiveClass = () => {
    setModalMode('add');
    setCurrentLiveClass(null);

    // Set default times (current time + 1 hour for start, + 2 hours for end)
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 hours

    // Format for datetime-local input (YYYY-MM-DDThh:mm)
    const formatDateTimeLocal = (date: Date) => {
      return date.toISOString().slice(0, 16);
    };

    setFormData({
      title: '',
      description: '',
      course: '',
      department: 'CSE',
      startTime: formatDateTimeLocal(startTime),
      endTime: formatDateTimeLocal(endTime),
      meetingLink: '',
      maxParticipants: 50,
      status: 'scheduled'
    });

    setFormErrors({
      title: '',
      description: '',
      course: '',
      startTime: '',
      endTime: '',
      meetingLink: '',
      maxParticipants: ''
    });

    setIsModalOpen(true);
  };

  // Open modal for editing live class
  const handleEditLiveClass = (liveClass: LiveClass) => {
    setModalMode('edit');
    setCurrentLiveClass(liveClass);

    // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
    const formatDateTimeLocal = (dateString: string) => {
      return new Date(dateString).toISOString().slice(0, 16);
    };

    setFormData({
      title: liveClass.title,
      description: liveClass.description,
      course: typeof liveClass.course === 'object' ? liveClass.course._id : liveClass.course,
      department: liveClass.department,
      startTime: formatDateTimeLocal(liveClass.startTime),
      endTime: formatDateTimeLocal(liveClass.endTime),
      meetingLink: liveClass.meetingLink,
      maxParticipants: liveClass.maxParticipants,
      status: liveClass.status
    });

    setFormErrors({
      title: '',
      description: '',
      course: '',
      startTime: '',
      endTime: '',
      meetingLink: '',
      maxParticipants: ''
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
        // Create new live class
        const newLiveClass = await liveClassAPI.createLiveClass({
          title: formData.title,
          description: formData.description,
          course: formData.course,
          department: formData.department,
          startTime: formData.startTime,
          endTime: formData.endTime,
          meetingLink: formData.meetingLink,
          maxParticipants: formData.maxParticipants,
          status: formData.status
        });

        // Find course title
        const course = courses.find(c => c._id === formData.course);

        // Add to live classes list
        setLiveClasses(prev => [
          ...prev,
          {
            ...newLiveClass,
            course: { _id: formData.course, title: course?.title || 'Unknown Course' },
            status: getLiveClassStatus(formData.startTime, formData.endTime, formData.status)
          }
        ]);

        toast.success('Live class created successfully');
      } else if (modalMode === 'edit' && currentLiveClass) {
        // Create FormData for update
        const formDataObj = new FormData();
        formDataObj.append('title', formData.title);
        formDataObj.append('description', formData.description);
        formDataObj.append('course', formData.course);
        formDataObj.append('department', formData.department);
        formDataObj.append('startTime', formData.startTime);
        formDataObj.append('endTime', formData.endTime);
        formDataObj.append('meetingLink', formData.meetingLink);
        formDataObj.append('maxParticipants', formData.maxParticipants.toString());
        formDataObj.append('status', formData.status);

        // Update existing live class
        const updatedLiveClass = await liveClassAPI.updateLiveClass(currentLiveClass._id, formDataObj);

        // Find course title
        const course = courses.find(c => c._id === formData.course);

        // Update live classes list
        setLiveClasses(prev =>
          prev.map(liveClass =>
            liveClass._id === currentLiveClass._id
              ? {
                  ...updatedLiveClass,
                  course: { _id: formData.course, title: course?.title || 'Unknown Course' },
                  status: getLiveClassStatus(formData.startTime, formData.endTime, formData.status)
                }
              : liveClass
          )
        );

        toast.success('Live class updated successfully');
      }

      // Close modal
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save live class');
    }
  };

  // Handle live class deletion
  const handleDeleteLiveClass = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this live class?')) {
      try {
        await liveClassAPI.deleteLiveClass(id);
        setLiveClasses(prev => prev.filter(liveClass => liveClass._id !== id));
        toast.success('Live class deleted successfully');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete live class');
      }
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLiveClasses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLiveClasses.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <FaVideo className={styles.titleIcon} /> Upcoming Live Classes
          </h2>
        </div>
        <div className="text-center py-4">Loading live classes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <FaVideo className={styles.titleIcon} /> Upcoming Live Classes
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
          <FaVideo className={styles.titleIcon} /> Upcoming Live Classes
        </h2>
        <button className={styles.addButton} onClick={handleAddLiveClass}>
          <FaPlus /> Add Live Class
        </button>
      </div>

      <div className={styles.searchContainer}>
        <div style={{ position: 'relative' }}>
          <FaSearch className={styles.searchIcon} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search live classes..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
      </div>

      {currentItems.length === 0 ? (
        <div className={styles.emptyState}>
          <FaVideo className={styles.emptyStateIcon} />
          <p className={styles.emptyStateText}>No live classes found</p>
          <button className={styles.addButton} onClick={handleAddLiveClass}>
            <FaPlus /> Add Live Class
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
                  <th>Start Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((liveClass) => (
                  <tr key={liveClass._id}>
                    <td>{liveClass.title}</td>
                    <td>{typeof liveClass.course === 'object' ? liveClass.course.title : liveClass.course}</td>
                    <td>{formatDateTime(liveClass.startTime)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`status${liveClass.status.charAt(0).toUpperCase() + liveClass.status.slice(1)}`]}`}>
                        {liveClass.status.charAt(0).toUpperCase() + liveClass.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <a
                          href={liveClass.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.actionButton} ${styles.linkButton}`}
                          title="Join Meeting"
                        >
                          <FaLink />
                        </a>
                        <button
                          className={`${styles.actionButton} ${styles.editButton}`}
                          title="Edit Live Class"
                          onClick={() => handleEditLiveClass(liveClass)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Delete Live Class"
                          onClick={() => handleDeleteLiveClass(liveClass._id)}
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

      {/* Live Class Modal */}
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modalMode === 'add' ? 'Add New Live Class' : 'Edit Live Class'}
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

              <div className={styles.formRow}>
                <div className={`${styles.formColumn} ${styles.formGroup}`}>
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

                <div className={`${styles.formColumn} ${styles.formGroup}`}>
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
              </div>

              <div className={styles.formRow}>
                <div className={`${styles.formColumn} ${styles.formGroup}`}>
                  <label htmlFor="startTime" className={styles.formLabel}>Start Time</label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={styles.formInput}
                  />
                  {formErrors.startTime && <p className={styles.errorText}>{formErrors.startTime}</p>}
                </div>

                <div className={`${styles.formColumn} ${styles.formGroup}`}>
                  <label htmlFor="endTime" className={styles.formLabel}>End Time</label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className={styles.formInput}
                  />
                  {formErrors.endTime && <p className={styles.errorText}>{formErrors.endTime}</p>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="meetingLink" className={styles.formLabel}>Meeting Link</label>
                <input
                  type="url"
                  id="meetingLink"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleInputChange}
                  placeholder="https://zoom.us/j/123456789"
                  className={styles.formInput}
                />
                {formErrors.meetingLink && <p className={styles.errorText}>{formErrors.meetingLink}</p>}
              </div>

              <div className={styles.formRow}>
                <div className={`${styles.formColumn} ${styles.formGroup}`}>
                  <label htmlFor="maxParticipants" className={styles.formLabel}>Maximum Participants</label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min="1"
                    className={styles.formInput}
                  />
                  {formErrors.maxParticipants && <p className={styles.errorText}>{formErrors.maxParticipants}</p>}
                </div>

                <div className={`${styles.formColumn} ${styles.formGroup}`}>
                  <label htmlFor="status" className={styles.formLabel}>Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
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
                  {modalMode === 'add' ? 'Create Live Class' : 'Update Live Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingLiveClassesManager;
