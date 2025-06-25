const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Admin credentials
const adminCredentials = {
  name: 'Admin User',
  email: 'admin@lms.com',
  password: 'Admin@123',
  role: 'admin'
};

// Function to seed admin user
const seedAdminUser = async () => {
  try {
    console.log('Checking for existing admin user...');
    
    // Check if admin user already exists
    const adminExists = await User.findOne({ email: adminCredentials.email });
    
    if (adminExists) {
      console.log('Admin user already exists. Skipping creation.');
      return;
    }
    
    // Create admin user
    console.log('Creating admin user...');
    const admin = new User(adminCredentials);
    await admin.save();
    
    console.log('Admin user created successfully:');
    console.log(`- Email: ${adminCredentials.email}`);
    console.log(`- Password: ${adminCredentials.password}`);
    console.log(`- Role: ${adminCredentials.role}`);
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

module.exports = seedAdminUser;
