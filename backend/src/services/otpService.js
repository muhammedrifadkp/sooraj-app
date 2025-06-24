const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Store OTPs in memory (in production, use Redis or another persistent store)
const otpStore = new Map();

// OTP expiration time in minutes
const OTP_EXPIRY_MINUTES = 10;

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP for a user
const saveOTP = (email, otp) => {
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + OTP_EXPIRY_MINUTES);

  otpStore.set(email.toLowerCase(), {
    otp,
    expiryTime
  });
};

// Verify OTP for a user
const verifyOTP = (email, otp) => {
  // In development mode, accept any 6-digit OTP for easier testing
  if (process.env.NODE_ENV !== 'production' && /^\d{6}$/.test(otp)) {
    console.log('Development mode: Accepting any 6-digit OTP');
    return { valid: true, message: 'OTP verified successfully (dev mode).', devMode: true };
  }

  const storedData = otpStore.get(email.toLowerCase());

  if (!storedData) {
    return { valid: false, message: 'OTP not found. Please request a new one.' };
  }

  if (new Date() > storedData.expiryTime) {
    // Remove expired OTP
    otpStore.delete(email.toLowerCase());
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (storedData.otp !== otp) {
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }

  // OTP is valid, remove it from store to prevent reuse
  otpStore.delete(email.toLowerCase());
  return { valid: true, message: 'OTP verified successfully.' };
};

// Send OTP via email
const sendOTPEmail = async (email, otp) => {
  try {
    // Create a test account if no SMTP configuration is provided
    // In production, use your actual SMTP configuration
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER || testAccount.user,
        pass: process.env.SMTP_PASS || testAccount.pass
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"LMS System" <noreply@lms.com>',
      to: email,
      subject: 'Your OTP for LMS Registration',
      text: `Your OTP for LMS registration is: ${otp}. This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #11254B; text-align: center;">LMS Registration</h2>
          <p>Hello,</p>
          <p>Thank you for registering with our Learning Management System. To complete your registration, please use the following One-Time Password (OTP):</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
          <p>If you did not request this OTP, please ignore this email.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('OTP email sent: %s', info.messageId);

    // For development, log the URL to preview the email
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email. Please try again.');
  }
};

// Generate and send OTP
const generateAndSendOTP = async (email) => {
  try {
    // Check if email exists in the database (for registration)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email is already registered. Please login instead.');
    }

    const otp = generateOTP();
    saveOTP(email, otp);

    // Print OTP in console for easy testing
    console.log('==================================================');
    console.log(`OTP for ${email} is: ${otp}`);
    console.log(`This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes`);
    console.log('==================================================');

    // Still try to send the email if possible
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Email sending failed, but OTP is available in console:', emailError);
    }

    // Return the OTP for development purposes
    return {
      success: true,
      message: 'OTP sent successfully.',
      otp: process.env.NODE_ENV !== 'production' ? otp : undefined
    };
  } catch (error) {
    console.error('Error generating and sending OTP:', error);
    throw error;
  }
};

module.exports = {
  generateAndSendOTP,
  verifyOTP
};
