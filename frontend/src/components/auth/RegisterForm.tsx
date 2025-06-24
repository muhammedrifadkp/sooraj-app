import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserAlt, FaGraduationCap, FaUserPlus } from 'react-icons/fa';
import styles from './AuthLayout.module.css';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import OtpVerification from './OtpVerification';
import { otpAPI } from '../../services/api';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'CSE',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  });
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      general: '',
    };
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Send OTP to user's email
  const sendOtp = async () => {
    try {
      setLoading(true);
      setErrors(prev => ({ ...prev, general: '' }));

      // Call the API to send OTP
      const response = await otpAPI.sendRegistrationOTP(formData.email);

      // Show OTP verification screen
      setShowOtpVerification(true);

      // If we're in development mode and the OTP is returned, show it for easier testing
      if (response.devMode && response.otp) {
        toast.success(`OTP sent to ${formData.email}. For testing, use: ${response.otp}`);
        console.log(`OTP for testing: ${response.otp}`);
      } else {
        toast.success(`OTP sent to ${formData.email}. Please check your inbox or server console.`);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send OTP. Please try again.';
      setErrors(prev => ({ ...prev, general: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      const response = await otpAPI.sendRegistrationOTP(formData.email);

      // If we're in development mode and the OTP is returned, show it for easier testing
      if (response.devMode && response.otp) {
        toast.success(`OTP resent to ${formData.email}. For testing, use: ${response.otp}`);
        console.log(`OTP for testing: ${response.otp}`);
      } else {
        toast.success(`OTP resent to ${formData.email}. Please check your inbox or server console.`);
      }

      return Promise.resolve();
    } catch (err) {
      toast.error('Failed to resend OTP. Please try again.');
      return Promise.reject(err);
    }
  };

  // Complete registration after OTP verification
  const completeRegistration = async () => {
    try {
      setLoading(true);

      await register(
        formData.name,
        formData.email,
        formData.password,
        'student',
        formData.department
      );

      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setErrors(prev => ({ ...prev, general: errorMessage }));
      toast.error(errorMessage);
      setShowOtpVerification(false); // Go back to registration form on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Send OTP for verification
    await sendOtp();
  };

  return (
    <>
      {showOtpVerification ? (
        <OtpVerification
          email={formData.email}
          onVerificationSuccess={completeRegistration}
          onResendOtp={handleResendOtp}
          onCancel={() => setShowOtpVerification(false)}
        />
      ) : (
        <form onSubmit={handleSubmit}>
          {errors.general && <div className={styles.errorText}>{errors.general}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>Full Name</label>
            <div className={styles.formInputWithIcon}>
              <FaUserAlt className={styles.formInputIcon} />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && <p className={styles.errorText}>{errors.name}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email Address</label>
            <div className={styles.formInputWithIcon}>
              <FaEnvelope className={styles.formInputIcon} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className={styles.errorText}>{errors.email}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="department" className={styles.formLabel}>Department</label>
            <div className={styles.formInputWithIcon}>
              <FaGraduationCap className={styles.formInputIcon} />
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={styles.formInput}
              >
                <option value="CSE">Computer Science Engineering (CSE)</option>
                <option value="EEE">Electrical & Electronics Engineering (EEE)</option>
                <option value="MECH">Mechanical Engineering (MECH)</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>Password</label>
            <div className={styles.formInputWithIcon}>
              <FaLock className={styles.formInputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Create a password"
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
            {errors.password && <p className={styles.errorText}>{errors.password}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm Password</label>
            <div className={styles.formInputWithIcon}>
              <FaLock className={styles.formInputIcon} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <p className={styles.errorText}>{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Continue to Verification'}
            {!loading && <FaUserPlus />}
          </button>

          <div className={styles.formFooter}>
            <p>
              Already have an account?{' '}
              <Link to="/login" className={styles.formFooterLink}>
                Sign in
              </Link>
            </p>
          </div>
        </form>
      )}
    </>
  );
};

export default RegisterForm;
