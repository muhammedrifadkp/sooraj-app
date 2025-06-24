const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  liveClassId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveClass'
  },
  type: {
    type: String,
    enum: ['login', 'class'],
    default: 'class'
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a user can only have one attendance record per class
attendanceSchema.index({ userId: 1, liveClassId: 1 }, { unique: true, partialFilterExpression: { liveClassId: { $exists: true } } });

module.exports = mongoose.model('Attendance', attendanceSchema); 