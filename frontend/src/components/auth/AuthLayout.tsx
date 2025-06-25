import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthLayout.module.css';
import { FaGraduationCap, FaBook, FaVideo, FaCertificate, FaChartLine } from 'react-icons/fa';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className={styles.authContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.decorationCircle + ' ' + styles.circle1}></div>
        <div className={styles.decorationCircle + ' ' + styles.circle2}></div>

        <div className={styles.leftPanelContent}>
          <h1 className={styles.welcomeTitle}>Welcome to LMS</h1>
          <p className={styles.welcomeSubtitle}>
            A comprehensive Learning Management System designed to enhance your educational experience.
          </p>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaGraduationCap />
              </div>
              <div className={styles.featureText}>
                Access to comprehensive courses and learning materials
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaVideo />
              </div>
              <div className={styles.featureText}>
                Participate in interactive live classes and webinars
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaBook />
              </div>
              <div className={styles.featureText}>
                Complete assignments and track your progress
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaCertificate />
              </div>
              <div className={styles.featureText}>
                Earn certificates upon course completion
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaChartLine />
              </div>
              <div className={styles.featureText}>
                Monitor your performance with detailed analytics
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>{title}</h2>
            <p className={styles.formSubtitle}>{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
