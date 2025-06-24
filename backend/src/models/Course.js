const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  department: {
    type: String,
    enum: ['CSE', 'EEE', 'MECH'],
    default: 'CSE'
  },
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: String,
    required: [true, 'Please provide course duration']
  },
  youtubeLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Basic validation for YouTube URL
        return !v || /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/.test(v);
      },
      message: 'Please provide a valid YouTube URL'
    }
  },
  thumbnail: {
    data: Buffer,
    contentType: String
  },
  completedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  modules: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'module'
    }
  }],
  materials: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    fileData: {
      data: Buffer,
      contentType: String
    },
    type: {
      type: String,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;