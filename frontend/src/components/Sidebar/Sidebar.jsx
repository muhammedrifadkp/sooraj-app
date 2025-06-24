import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

// Import icons (assuming you're using react-icons)
import {
  FaHome,
  FaBook,
  FaTasks,
  FaCalendarAlt,
  FaVideo,
  FaComments,
  FaChartBar,
  FaCertificate,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher
} from 'react-icons/fa';

const Sidebar = ({ collapsed, currentPath }) => {
  const { user, logout, isAdmin } = useAuth();

  // Get first letter of name for avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  // Navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      { path: '/dashboard', icon: <FaHome />, text: 'Dashboard' },
      { path: '/profile', icon: <FaUser />, text: 'Profile' },
    ];

    const studentItems = [
      { path: '/courses', icon: <FaBook />, text: 'My Courses' },
      { path: '/assignments', icon: <FaTasks />, text: 'Assignments' },
      { path: '/attendance', icon: <FaCalendarAlt />, text: 'Attendance' },
      { path: '/live-classes', icon: <FaVideo />, text: 'Live Classes' },
      { path: '/certificates', icon: <FaCertificate />, text: 'Certificates' },
      { path: '/my-results', icon: <FaChartBar />, text: 'My Results' },
    ];

    const adminItems = [
      { path: '/admin/users', icon: <FaUsers />, text: 'Users' },
      { path: '/admin/courses', icon: <FaBook />, text: 'Courses' },
      { path: '/admin/assignments', icon: <FaTasks />, text: 'Assignments' },
      { path: '/admin/live-classes', icon: <FaVideo />, text: 'Live Classes' },
      { path: '/admin/upcoming-events', icon: <FaCalendarAlt />, text: 'Upcoming Events' },
      { path: '/admin/class-management', icon: <FaChalkboardTeacher />, text: 'Classes' },
      { path: '/admin/settings', icon: <FaCog />, text: 'Settings' },
    ];

    if (isAdmin) {
      return [...commonItems, ...adminItems];
    } else {
      return [...commonItems, ...studentItems];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      <div className={styles.logo}>
        <img src="/logo.png" alt="LMS Logo" className={styles.logoImage} />
        <span className={styles.logoText}>EduCRM</span>
      </div>

      <nav className={styles.navItems}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${
              currentPath === item.path ? styles.navItemActive : ''
            }`}
            data-tooltip={item.text}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navText}>{item.text}</span>
          </Link>
        ))}

        <div className={styles.sectionTitle}>Account</div>

        <Link
          to="/settings"
          className={`${styles.navItem} ${
            currentPath === '/settings' ? styles.navItemActive : ''
          }`}
          data-tooltip="Settings"
        >
          <span className={styles.navIcon}><FaCog /></span>
          <span className={styles.navText}>Settings</span>
        </Link>

        <a
          href="#"
          className={styles.navItem}
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
          data-tooltip="Logout"
        >
          <span className={styles.navIcon}><FaSignOutAlt /></span>
          <span className={styles.navText}>Logout</span>
        </a>
      </nav>

      <div className={styles.userSection}>
        <div className={styles.userAvatar}>
          {getInitials(user?.name)}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user?.name}</div>
          <div className={styles.userRole}>{user?.role}</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
