import React, { useState, useEffect, useRef } from 'react';
import { FaEnvelope, FaLock, FaRedo } from 'react-icons/fa';
import styles from './AuthLayout.module.css';
import { toast } from 'react-hot-toast';
import { otpAPI } from '../../services/api';

interface OtpVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onResendOtp: () => Promise<void>;
  onCancel: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({
  email,
  onVerificationSuccess,
  onResendOtp,
  onCancel
}) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Set up countdown timer
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];

    // Handle paste event with multiple characters
    if (value.length > 1) {
      // If pasting, distribute the digits across the fields
      const digits = value.split('').slice(0, 6 - index);
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp);

      // Focus on the next empty input or the last input
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Normal single digit input
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input if a digit was entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle key down events for backspace and arrow navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Move to previous input on left arrow
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      // Move to next input on right arrow
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP verification
  const handleVerify = async () => {
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Call the API to verify the OTP
      const response = await otpAPI.verifyOTP(email, otpValue);

      if (response.success) {
        onVerificationSuccess();
        toast.success('Email verified successfully!');
      } else {
        throw new Error(response.message || 'Invalid OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP. Please try again.');
      toast.error('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError('');

      await onResendOtp();

      setCountdown(60);
      setCanResend(false);
      toast.success('OTP resent successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.formHeader} style={{ marginBottom: '1.5rem' }}>
        <h3 className={styles.formTitle}>Verify Your Email</h3>
        <p className={styles.formSubtitle}>
          We've sent a 6-digit verification code to <strong>{email}</strong>
        </p>
      </div>

      {error && <div className={styles.errorText}>{error}</div>}

      <div className={styles.otpContainer}>
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength={6}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            ref={(ref) => (inputRefs.current[index] = ref)}
            className={styles.otpInput}
            autoFocus={index === 0}
          />
        ))}
      </div>

      <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
        <button
          type="button"
          className={styles.submitButton}
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </div>

      <div className={styles.otpActions}>
        <button
          type="button"
          className={styles.resendButton}
          onClick={handleResendOtp}
          disabled={!canResend || loading}
        >
          <FaRedo className={styles.resendIcon} />
          Resend OTP {!canResend && `(${countdown}s)`}
        </button>

        <button
          type="button"
          className={styles.changeEmailButton}
          onClick={onCancel}
        >
          Change Email
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
