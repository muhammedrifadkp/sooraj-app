import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaGoogle, FaMicrosoft, FaUser, FaUserShield, FaChalkboardTeacher, FaCopy } from 'react-icons/fa';
import styles from './AuthLayout.module.css';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

interface LoginFormProps {
  isAdmin?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ isAdmin = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Test credentials data
  const testCredentials = [
    {
      type: 'Admin',
      icon: <FaUserShield />,
      accounts: [
        { name: 'Main Admin', email: 'admin@lms.com', password: 'Admin@123', department: 'Administration' },
        { name: 'CS Admin', email: 'csadmin@lms.com', password: 'CSAdmin@123', department: 'CSE' },
        { name: 'EEE Admin', email: 'eeeadmin@lms.com', password: 'EEEAdmin@123', department: 'EEE' },
        { name: 'MECH Admin', email: 'mechadmin@lms.com', password: 'MECHAdmin@123', department: 'MECH' },
        { name: 'Super Admin', email: 'superadmin@lms.com', password: 'Super@123', department: 'All' }
      ]
    },
    {
      type: 'Student',
      icon: <FaUser />,
      accounts: [
        { name: 'CS Student', email: 'student@lms.com', password: 'Student@123', department: 'CSE' },
        { name: 'EEE Student', email: 'eee.student@lms.com', password: 'Student@123', department: 'EEE' },
        { name: 'MECH Student', email: 'mech.student@lms.com', password: 'Student@123', department: 'MECH' }
      ]
    },
    {
      type: 'Instructor',
      icon: <FaChalkboardTeacher />,
      accounts: [
        { name: 'CS Instructor', email: 'instructor@lms.com', password: 'Instructor@123', department: 'CSE' },
        { name: 'EEE Instructor', email: 'eee.instructor@lms.com', password: 'Instructor@123', department: 'EEE' },
        { name: 'MECH Instructor', email: 'mech.instructor@lms.com', password: 'Instructor@123', department: 'MECH' }
      ]
    }
  ];

  // Function to fill credentials
  const fillCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    toast.success('Credentials filled! Click Login to continue.');
  };

  // Function to copy credentials to clipboard
  const copyCredentials = (email: string, password: string) => {
    const text = `Email: ${email}\nPassword: ${password}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Credentials copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy credentials');
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setError('');
      setLoading(true);

      await login(email, password);

      // Redirect based on role
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }

      toast.success('Login successful!');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className={styles.errorText}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.formLabel}>Email Address</label>
        <div className={styles.formInputWithIcon}>
          <FaEnvelope className={styles.formInputIcon} />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.formInput}
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.formLabel}>Password</label>
        <div className={styles.formInputWithIcon}>
          <FaLock className={styles.formInputIcon} />
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.formInput}
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      <div className={styles.rememberForgot}>
        <label className={styles.rememberMe}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className={styles.rememberMeCheckbox}
          />
          Remember me
        </label>

        <Link to="/forgot-password" className={styles.forgotPassword}>
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
        {!loading && <FaSignInAlt />}
      </button>

      <div className={styles.formDivider}>Or continue with</div>

      <div className={styles.socialLogin}>
        <button
          type="button"
          className={styles.socialButton}
          onClick={() => toast.error('Google login not implemented yet')}
        >
          <FaGoogle className={styles.googleIcon} />
          Google
        </button>

        <button
          type="button"
          className={styles.socialButton}
          onClick={() => toast.error('Microsoft login not implemented yet')}
        >
          <FaMicrosoft className={styles.microsoftIcon} />
          Microsoft
        </button>
      </div>

      {/* Test Credentials Section */}
      <div className={styles.testCredentials}>
        <div className={styles.testCredentialsHeader}>
          <h4 className={styles.testCredentialsTitle}>Test Accounts</h4>
          <p className={styles.testCredentialsSubtitle}>Click to auto-fill credentials</p>
        </div>

        {testCredentials.map((category) => (
          <div key={category.type} className={styles.credentialCategory}>
            <div className={styles.categoryHeader}>
              {category.icon}
              <span className={styles.categoryTitle}>{category.type} Accounts</span>
            </div>

            <div className={styles.accountsList}>
              {category.accounts.map((account, index) => (
                <div key={index} className={styles.accountItem}>
                  <div className={styles.accountInfo}>
                    <div className={styles.accountName}>{account.name}</div>
                    <div className={styles.accountEmail}>{account.email}</div>
                    <div className={styles.accountDepartment}>{account.department}</div>
                  </div>

                  <div className={styles.accountActions}>
                    <button
                      type="button"
                      className={styles.fillButton}
                      onClick={() => fillCredentials(account.email, account.password)}
                      title="Fill credentials"
                    >
                      Fill
                    </button>
                    <button
                      type="button"
                      className={styles.copyButton}
                      onClick={() => copyCredentials(account.email, account.password)}
                      title="Copy credentials"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.formFooter}>
        {isAdmin ? (
          <p>
            Not an administrator?{' '}
            <Link to="/login" className={styles.formFooterLink}>
              Login as Student
            </Link>
          </p>
        ) : (
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className={styles.formFooterLink}>
              Sign up
            </Link>
          </p>
        )}
      </div>
    </form>
  );
};

export default LoginForm;
