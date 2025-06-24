const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    console.log('Auth middleware - Starting request');
    console.log('Auth middleware - Headers:', req.headers);
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth middleware - Token found:', token ? 'yes' : 'no');
    }

    if (!token) {
      console.log('Auth middleware - No token found');
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      // Verify token
      console.log('Auth middleware - Verifying token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Auth middleware - Token decoded:', decoded);

      // Get user from token
      console.log('Auth middleware - Finding user with ID:', decoded.id);
      const user = await User.findById(decoded.id).select('-password');
      console.log('Auth middleware - User found:', user ? 'yes' : 'no');
      
      if (!user) {
        console.log('Auth middleware - User not found in database');
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      console.log('Auth middleware - User attached to request:', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
      next();
    } catch (error) {
      console.error('Auth middleware - Token verification error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired',
          error: error.message
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token',
          error: error.message
        });
      }
      
      return res.status(401).json({ 
        message: 'Not authorized, token failed',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Auth middleware - General error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role.toLowerCase() === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// Middleware to check if user is instructor
const isInstructor = (req, res, next) => {
  if (req.user && req.user.role.toLowerCase() === 'instructor') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as instructor' });
  }
};

module.exports = { protect, isAdmin, isInstructor }; 