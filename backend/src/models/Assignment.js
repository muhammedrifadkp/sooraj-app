const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide a course'],
    validate: {
      validator: async function(value) {
        // Check if the course exists
        const Course = mongoose.model('Course');
        const course = await Course.findById(value);
        return course !== null;
      },
      message: 'Course does not exist'
    }
  },
  title: {
    type: String,
    required: [true, 'Please provide an assignment title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide an assignment description']
  },
  department: {
    type: String,
    enum: ['CSE', 'EEE', 'MECH'],
    required: [true, 'Please provide a department'],
    default: 'CSE'
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a due date']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please provide total marks'],
    min: [1, 'Total marks must be at least 1'],
    max: [100, 'Total marks cannot exceed 100']
  },
  instructions: {
    type: String,
    required: [true, 'Please provide instructions']
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  questions: [{
    text: {
      type: String,
      required: [true, 'Please provide question text']
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'short-answer', 'essay', 'long-answer'],
      required: [true, 'Please provide question type']
    },
    options: [String],
    correctAnswer: {
      type: String,
      required: [true, 'Please provide correct answer']
    },
    marks: {
      type: Number,
      default: 1
    },
    answerFormat: {
      type: String,
      enum: ['short', 'long'],
      default: function() {
        return this.type === 'short-answer' ? 'short' : 'long';
      }
    }
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answers: [{
      questionId: Number,
      answer: String,
      isCorrect: Boolean,
      marks: Number,
      feedback: String
    }],
    submittedAt: {
      type: Date,
      default: Date.now
    },
    evaluation: {
      totalMarks: Number,
      earnedMarks: Number,
      percentage: Number,
      scaledScore: Number,
      status: {
        type: String,
        enum: ['pending', 'evaluated', 'graded'],
        default: 'pending'
      },
      evaluatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      evaluatedAt: Date,
      feedback: String,
      comments: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
assignmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;