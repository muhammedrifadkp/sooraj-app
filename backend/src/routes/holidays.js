const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const Holiday = require('../models/Holiday');

// Get all holidays
router.get('/', protect, async (req, res) => {
  try {
    console.log('Fetching all holidays...');
    const holidays = await Holiday.find().sort({ date: 1 });
    console.log('Found holidays:', holidays);
    res.json(holidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ message: error.message });
  }
});

// Save holidays (admin only)
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { holidays } = req.body;
    console.log('Received holidays to save:', holidays);
    
    if (!Array.isArray(holidays)) {
      return res.status(400).json({ message: 'Holidays must be an array' });
    }

    // Delete all existing holidays first
    console.log('Deleting existing holidays...');
    await Holiday.deleteMany({});

    // Insert new holidays
    console.log('Inserting new holidays...');
    const savedHolidays = await Holiday.insertMany(
      holidays.map(holiday => ({
        date: new Date(holiday.date),
        name: holiday.name,
        type: holiday.type || 'custom'
      }))
    );
    console.log('Saved holidays:', savedHolidays);

    res.status(201).json(savedHolidays);
  } catch (error) {
    console.error('Error saving holidays:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 