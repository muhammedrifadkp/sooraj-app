import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserGraduate, FaUserTie, FaArrowRight } from 'react-icons/fa';
import styles from '../components/auth/AuthLayout.module.css';
import AuthLayout from '../components/auth/AuthLayout';

const SelectRole = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Choose Your Role"
      subtitle="Select your role to access the appropriate login page"
    >
      <div className={styles.roleSelector} style={{ marginTop: '2rem' }}>
        <div
          className={styles.roleOption}
          onClick={() => navigate('/login')}
          style={{ cursor: 'pointer' }}
        >
          <FaUserGraduate size={40} />
          <span>Student</span>
        </div>
        <div
          className={styles.roleOption}
          onClick={() => navigate('/admin/login')}
          style={{ cursor: 'pointer' }}
        >
          <FaUserTie size={40} />
          <span>Administrator</span>
        </div>
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <p className={styles.formSubtitle}>
          New to our platform?
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className={styles.formFooterLink}
            style={{ marginLeft: '0.5rem' }}
          >
            Create an account
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SelectRole;