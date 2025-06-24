const otpService = require('../services/otpService');

// Send OTP for registration
const sendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const result = await otpService.generateAndSendOTP(email);

    // In development mode, return the OTP for easier testing
    if (process.env.NODE_ENV !== 'production' && result.otp) {
      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        otp: result.otp,
        devMode: true
      });
    }

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending registration OTP:', error);
    res.status(400).json({ message: error.message || 'Failed to send OTP' });
  }
};

// Verify OTP
const verifyOTP = (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const result = otpService.verifyOTP(email, otp);

    if (result.valid) {
      res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(400).json({ message: error.message || 'Failed to verify OTP' });
  }
};

module.exports = {
  sendRegistrationOTP,
  verifyOTP
};
