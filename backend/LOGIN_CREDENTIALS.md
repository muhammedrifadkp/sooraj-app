# LMS System Login Credentials

This document contains the preset login credentials for the Learning Management System.

## Admin Account
- **Email:** admin@lms.com
- **Password:** Admin@123
- **Role:** admin

## Student Account
- **Email:** student@lms.com
- **Password:** Student@123
- **Role:** student
- **Department:** CSE

## Instructor Account
- **Email:** instructor@lms.com
- **Password:** Instructor@123
- **Role:** instructor

These accounts are automatically created when the server starts if they don't already exist in the database. You can use these credentials to test different roles and functionalities in the system.

## How It Works

The seeding scripts are located in:
- `src/utils/seedAdmin.js` - Creates the admin account
- `src/utils/seedTestUsers.js` - Creates the student and instructor accounts

These scripts run automatically when the server connects to MongoDB.
