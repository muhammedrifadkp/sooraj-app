import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Dashboard.module.css';

// Import icons
import { 
  FaBook, 
  FaTasks, 
  FaCalendarAlt, 
  FaVideo, 
  FaClock, 
  FaUser, 
  FaPlayCircle, 
  FaFileAlt, 
  FaCheckCircle 
} from 'react-icons/fa';

const StudentDashboard = () => {
  const { user } = useAuth();
  
  // Mock data - replace with actual data from your API
  const stats = [
    { icon: <FaBook />, value: '5', label: 'Enrolled Courses' },
    { icon: <FaTasks />, value: '12', label: 'Assignments' },
    { icon: <FaCalendarAlt />, value: '85%', label: 'Attendance' },
    { icon: <FaVideo />, value: '3', label: 'Upcoming Classes' }
  ];
  
  const courses = [
    {
      id: 1,
      title: 'Introduction to Computer Science',
      instructor: 'Dr. John Smith',
      progress: 75,
      image: '/course1.jpg',
      modules: 12,
      hours: 24
    },
    {
      id: 2,
      title: 'Advanced Mathematics',
      instructor: 'Prof. Sarah Johnson',
      progress: 45,
      image: '/course2.jpg',
      modules: 10,
      hours: 20
    },
    {
      id: 3,
      title: 'Digital Electronics',
      instructor: 'Dr. Michael Brown',
      progress: 90,
      image: '/course3.jpg',
      modules: 8,
      hours: 16
    }
  ];
  
  const assignments = [
    {
      id: 1,
      title: 'Data Structures Assignment',
      course: 'Introduction to Computer Science',
      dueDate: '2023-06-15',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Calculus Problem Set',
      course: 'Advanced Mathematics',
      dueDate: '2023-06-18',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Circuit Design Project',
      course: 'Digital Electronics',
      dueDate: '2023-06-20',
      status: 'pending'
    }
  ];
  
  const events = [
    {
      id: 1,
      title: 'Data Structures Live Class',
      course: 'Introduction to Computer Science',
      date: '2023-06-14 10:00 AM',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Mathematics Doubt Clearing Session',
      course: 'Advanced Mathematics',
      date: '2023-06-16 02:00 PM',
      status: 'upcoming'
    }
  ];
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className={styles.dashboardContainer}>
      <section className={styles.welcomeSection}>
        <div className={styles.welcomePattern}></div>
        <h2 className={styles.welcomeTitle}>Welcome back, {user?.name}!</h2>
        <p className={styles.welcomeSubtitle}>
          Track your progress, manage your courses, and stay updated with your assignments and upcoming classes.
        </p>
      </section>
      
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
      
      <section>
        <h3 className={styles.sectionTitle}>
          <FaBook className={styles.sectionIcon} /> My Courses
        </h3>
        
        <div className={styles.coursesGrid}>
          {courses.map((course) => (
            <Link to={`/courses/${course.id}`} key={course.id} className={styles.courseCard}>
              <div className={styles.courseImage}>
                <img src={course.image} alt={course.title} />
                <div className={styles.courseProgress}>
                  <div 
                    className={styles.courseProgressBar} 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className={styles.courseContent}>
                <h4 className={styles.courseTitle}>{course.title}</h4>
                <p className={styles.courseInstructor}>
                  <FaUser style={{ marginRight: '5px' }} /> {course.instructor}
                </p>
                <div className={styles.courseStats}>
                  <div className={styles.courseStat}>
                    <FaPlayCircle className={styles.courseStatIcon} />
                    {course.modules} Modules
                  </div>
                  <div className={styles.courseStat}>
                    <FaClock className={styles.courseStatIcon} />
                    {course.hours} Hours
                  </div>
                  <div className={styles.courseStat}>
                    <FaCheckCircle className={styles.courseStatIcon} />
                    {course.progress}%
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      <section className={styles.upcomingSection}>
        <div className={styles.assignmentsList}>
          <h3 className={styles.listTitle}>Upcoming Assignments</h3>
          
          {assignments.map((assignment) => (
            <div key={assignment.id} className={styles.listItem}>
              <div className={styles.listItemIcon}>
                <FaFileAlt />
              </div>
              <div className={styles.listItemContent}>
                <h4 className={styles.listItemTitle}>{assignment.title}</h4>
                <div className={styles.listItemMeta}>
                  <div className={styles.listItemDate}>
                    <FaCalendarAlt className={styles.listItemDateIcon} />
                    Due: {formatDate(assignment.dueDate)}
                  </div>
                  <div className={styles.listItemCourse}>
                    <FaBook className={styles.listItemCourseIcon} />
                    {assignment.course}
                  </div>
                </div>
              </div>
              <div className={`${styles.listItemStatus} ${styles[`status${assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}`]}`}>
                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
              </div>
            </div>
          ))}
          
          <Link to="/assignments" style={{ 
            display: 'block', 
            textAlign: 'center', 
            marginTop: 'var(--spacing-md)',
            color: 'var(--color-accent)',
            fontWeight: 'var(--font-weight-medium)'
          }}>
            View All Assignments
          </Link>
        </div>
        
        <div className={styles.eventsList}>
          <h3 className={styles.listTitle}>Upcoming Live Classes</h3>
          
          {events.map((event) => (
            <div key={event.id} className={styles.listItem}>
              <div className={styles.listItemIcon}>
                <FaVideo />
              </div>
              <div className={styles.listItemContent}>
                <h4 className={styles.listItemTitle}>{event.title}</h4>
                <div className={styles.listItemMeta}>
                  <div className={styles.listItemDate}>
                    <FaCalendarAlt className={styles.listItemDateIcon} />
                    {event.date}
                  </div>
                </div>
              </div>
              <div className={`${styles.listItemStatus} ${styles[`status${event.status.charAt(0).toUpperCase() + event.status.slice(1)}`]}`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </div>
            </div>
          ))}
          
          <Link to="/live-classes" style={{ 
            display: 'block', 
            textAlign: 'center', 
            marginTop: 'var(--spacing-md)',
            color: 'var(--color-accent)',
            fontWeight: 'var(--font-weight-medium)'
          }}>
            View All Classes
          </Link>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
