const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Test user credentials
const testUsers = [
  {
    name: 'Student User',
    email: 'student@lms.com',
    password: 'Student@123',
    role: 'student',
    department: 'CSE'
  },
  {
    name: 'Instructor User',
    email: 'instructor@lms.com',
    password: 'Instructor@123',
    role: 'instructor'
  }
];

// Function to seed test users
const seedTestUsers = async () => {
  try {
    console.log('Checking for existing test users...');
    
    for (const userData of testUsers) {
      // Check if user already exists
      const userExists = await User.findOne({ email: userData.email });
      
      if (userExists) {
        console.log(`User with email ${userData.email} already exists. Skipping creation.`);
        continue;
      }
      
      // Create user
      console.log(`Creating ${userData.role} user...`);
      const user = new User(userData);
      await user.save();
      
      console.log(`${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} user created successfully:`);
      console.log(`- Email: ${userData.email}`);
      console.log(`- Password: ${userData.password}`);
      console.log(`- Role: ${userData.role}`);
      if (userData.department) {
        console.log(`- Department: ${userData.department}`);
      }
    }
    
    console.log('Test users seeding completed.');
  } catch (error) {
    console.error('Error seeding test users:', error);
  }
};

module.exports = seedTestUsers;
