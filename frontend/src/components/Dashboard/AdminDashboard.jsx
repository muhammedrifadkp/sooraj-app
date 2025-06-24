import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './Dashboard.module.css';

// Import icons
import { 
  FaUsers, 
  FaBook, 
  FaTasks, 
  FaVideo, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaCalendarAlt, 
  FaChartLine, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaClock 
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Mock data - replace with actual data from your API
  const stats = [
    { icon: <FaUsers />, value: '250', label: 'Total Students' },
    { icon: <FaChalkboardTeacher />, value: '15', label: 'Instructors' },
    { icon: <FaBook />, value: '32', label: 'Active Courses' },
    { icon: <FaVideo />, value: '8', label: 'Live Classes Today' }
  ];
  
  const recentActivities = [
    {
      id: 1,
      type: 'user',
      title: 'New Student Registration',
      description: 'John Doe registered as a new student',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'course',
      title: 'New Course Added',
      description: 'Introduction to Artificial Intelligence',
      time: '5 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'assignment',
      title: 'Assignment Deadline Updated',
      description: 'Data Structures Assignment deadline extended',
      time: '1 day ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'class',
      title: 'Live Class Scheduled',
      description: 'Advanced Database Systems - 10:00 AM Tomorrow',
      time: '1 day ago',
      status: 'upcoming'
    }
  ];
  
  const pendingTasks = [
    {
      id: 1,
      title: 'Review Course Content',
      description: 'Introduction to Machine Learning',
      deadline: '2023-06-15'
    },
    {
      id: 2,
      title: 'Approve Instructor Applications',
      description: '3 new applications pending',
      deadline: '2023-06-16'
    },
    {
      id: 3,
      title: 'Update System Settings',
      description: 'Email notification templates',
      deadline: '2023-06-18'
    }
  ];
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get icon based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return <FaUserGraduate />;
      case 'course':
        return <FaBook />;
      case 'assignment':
        return <FaTasks />;
      case 'class':
        return <FaVideo />;
      default:
        return <FaCheckCircle />;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <section className={styles.welcomeSection}>
        <div className={styles.welcomePattern}></div>
        <h2 className={styles.welcomeTitle}>Welcome back, {user?.name}!</h2>
        <p className={styles.welcomeSubtitle}>
          Manage your LMS system, monitor student progress, and keep track of all activities from this admin dashboard.
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
          <FaChartLine className={styles.sectionIcon} /> System Overview
        </h3>
        
        {/* This would be a chart component in a real implementation */}
        <div style={{ 
          height: '300px', 
          backgroundColor: 'var(--color-white)', 
          borderRadius: 'var(--border-radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--spacing-lg)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <p style={{ color: 'var(--color-dark-gray)' }}>Analytics Chart Would Go Here</p>
        </div>
      </section>
      
      <section className={styles.upcomingSection}>
        <div className={styles.assignmentsList}>
          <h3 className={styles.listTitle}>Recent Activities</h3>
          
          {recentActivities.map((activity) => (
            <div key={activity.id} className={styles.listItem}>
              <div className={styles.listItemIcon}>
                {getActivityIcon(activity.type)}
              </div>
              <div className={styles.listItemContent}>
                <h4 className={styles.listItemTitle}>{activity.title}</h4>
                <div className={styles.listItemMeta}>
                  <div className={styles.listItemDate}>
                    <FaClock className={styles.listItemDateIcon} />
                    {activity.time}
                  </div>
                  <div className={styles.listItemCourse}>
                    {activity.description}
                  </div>
                </div>
              </div>
              <div className={`${styles.listItemStatus} ${styles[`status${activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}`]}`}>
                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
              </div>
            </div>
          ))}
          
          <Link to="/admin/recent-activity" style={{ 
            display: 'block', 
            textAlign: 'center', 
            marginTop: 'var(--spacing-md)',
            color: 'var(--color-accent)',
            fontWeight: 'var(--font-weight-medium)'
          }}>
            View All Activities
          </Link>
        </div>
        
        <div className={styles.eventsList}>
          <h3 className={styles.listTitle}>Pending Tasks</h3>
          
          {pendingTasks.map((task) => (
            <div key={task.id} className={styles.listItem}>
              <div className={styles.listItemIcon}>
                <FaExclamationTriangle />
              </div>
              <div className={styles.listItemContent}>
                <h4 className={styles.listItemTitle}>{task.title}</h4>
                <div className={styles.listItemMeta}>
                  <div className={styles.listItemDate}>
                    <FaCalendarAlt className={styles.listItemDateIcon} />
                    Due: {formatDate(task.deadline)}
                  </div>
                  <div className={styles.listItemCourse}>
                    {task.description}
                  </div>
                </div>
              </div>
              <div className={`${styles.listItemStatus} ${styles.statusPending}`}>
                Pending
              </div>
            </div>
          ))}
          
          <Link to="/admin/tasks" style={{ 
            display: 'block', 
            textAlign: 'center', 
            marginTop: 'var(--spacing-md)',
            color: 'var(--color-accent)',
            fontWeight: 'var(--font-weight-medium)'
          }}>
            View All Tasks
          </Link>
        </div>
      </section>
      
      <section>
        <h3 className={styles.sectionTitle}>
          <FaUsers className={styles.sectionIcon} /> Quick Actions
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--spacing-md)'
        }}>
          <Link to="/admin/add-course" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition-default)',
            textDecoration: 'none',
            color: 'var(--color-primary)'
          }}>
            <FaBook style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }} />
            <span>Add New Course</span>
          </Link>
          
          <Link to="/admin/add-assignment" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition-default)',
            textDecoration: 'none',
            color: 'var(--color-primary)'
          }}>
            <FaTasks style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }} />
            <span>Create Assignment</span>
          </Link>
          
          <Link to="/admin/add-live-class" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition-default)',
            textDecoration: 'none',
            color: 'var(--color-primary)'
          }}>
            <FaVideo style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }} />
            <span>Schedule Live Class</span>
          </Link>
          
          <Link to="/admin/users" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition-default)',
            textDecoration: 'none',
            color: 'var(--color-primary)'
          }}>
            <FaUsers style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }} />
            <span>Manage Users</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
