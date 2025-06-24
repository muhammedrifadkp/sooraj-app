const mongoose = require('mongoose');

const gradedResultSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedAt: {
    type: Date,
    default: Date.now
  },
  answers: [{
    questionId: Number,
    questionText: String,
    questionType: {
      type: String,
      enum: ['multiple-choice', 'short-answer', 'essay', 'long-answer']
    },
    studentAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    marks: Number,
    maxMarks: Number,
    feedback: String
  }],
  totalMarks: {
    type: Number,
    required: true
  },
  earnedMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  scaledScore: Number,
  status: {
    type: String,
    enum: ['pending', 'evaluated', 'graded'],
    default: 'evaluated'
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  overallFeedback: String,
  comments: String,
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }
});

// Create a compound index for assignment and student
// This ensures each student can have only one graded result per assignment
gradedResultSchema.index({ assignment: 1, student: 1 }, { unique: true });

const GradedResult = mongoose.model('GradedResult', gradedResultSchema);

module.exports = GradedResult; 