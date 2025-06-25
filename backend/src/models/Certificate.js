const mongoose = require('mongoose');

async function generateCertificateNumber() {
  const timestamp = Date.now().toString();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CERT-${timestamp}-${randomNum}`;
}

const certificateSchema = new mongoose.Schema({
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
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  certificateNumber: {
    type: String,
    unique: true
  },
  grade: {
    type: String,
    required: true
  },
  completionDate: {
    type: Date,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'issued', 'revoked'],
    default: 'pending'
  },
  signature: {
    type: String,
    required: true,
    default: 'Course Instructor'
  },
  courseCompletion: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add certificate number before saving if not provided
certificateSchema.pre('save', async function(next) {
  if (!this.certificateNumber) {
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      try {
        this.certificateNumber = await generateCertificateNumber();
        // Check if this certificate number already exists
        const existing = await mongoose.model('Certificate').findOne({ certificateNumber: this.certificateNumber });
        if (!existing) {
          break; // Found a unique number
        }
      } catch (error) {
        console.error('Error generating certificate number:', error);
      }
      attempts++;
    }

    if (attempts === maxAttempts) {
      throw new Error('Unable to generate unique certificate number after multiple attempts');
    }
  }
  next();
});

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate; 