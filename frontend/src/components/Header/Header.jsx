import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

// Import icons
import { 
  FaBars, 
  FaSearch, 
  FaBell, 
  FaEnvelope, 
  FaChevronDown 
} from 'react-icons/fa';

const Header = ({ toggleSidebar, sidebarCollapsed }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get page title from current path
  const getPageTitle = () => {
    const path = location.pathname;
    
    // Remove leading slash and split by remaining slashes
    const segments = path.substring(1).split('/');
    
    if (segments[0] === '') return 'Dashboard';
    
    // Convert first segment to title case
    const title = segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
    
    // Handle special cases
    if (segments[0] === 'admin' && segments.length > 1) {
      const adminPage = segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
      return `Admin ${adminPage}`;
    }
    
    return title.replace(/-/g, ' ');
  };
  
  // Get first letter of name for avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button 
          className={styles.menuToggle} 
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <FaBars />
        </button>
        <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
      </div>
      
      <div className={styles.rightSection}>
        <form className={styles.searchBar} onSubmit={handleSearch}>
          <span className={styles.searchIcon}><FaSearch /></span>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        
        <button className={styles.iconButton} aria-label="Notifications">
          <FaBell />
          <span className={styles.notificationBadge}>3</span>
        </button>
        
        <button className={styles.iconButton} aria-label="Messages">
          <FaEnvelope />
          <span className={styles.notificationBadge}>5</span>
        </button>
        
        <div className={styles.userMenu}>
          <div className={styles.userAvatar}>
            {getInitials(user?.name)}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name}</div>
            <div className={styles.userRole}>{user?.role}</div>
          </div>
          <FaChevronDown style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--color-dark-gray)' }} />
        </div>
      </div>
    </header>
  );
};

export default Header;
