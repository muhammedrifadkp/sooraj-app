const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, isAdmin, isInstructor } = require('../middleware/authMiddleware');
const Assignment = require('../models/Assignment');
const Certificate = require('../models/Certificate');
const GradedResult = require('../models/GradedResult');
const { normalizeAnswer, validateAnswer } = require('../utils/answerValidation');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/assignments/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate({
        path: 'course',
        select: 'title instructor',
        populate: {
          path: 'instructor',
          select: '_id name'
        }
      });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single assignment
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course', 'title');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create assignment (protected route)
router.post('/', protect, upload.array('files', 5), async (req, res) => {
  try {
    console.log('Received assignment creation request:', req.body);
    
    const {
      title,
      description,
      course,
      department,
      dueDate,
      totalMarks,
      instructions,
      questions
    } = req.body;

    // Validate required fields
    const requiredFields = ['title', 'description', 'course', 'department', 'dueDate', 'totalMarks', 'instructions'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Parse questions from JSON string
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (error) {
      console.error('Error parsing questions:', error);
      return res.status(400).json({ message: 'Invalid questions format' });
    }

    // Create assignment object
    const assignment = new Assignment({
      title,
      description,
      course,
      department,
      dueDate,
      totalMarks,
      instructions,
      questions: parsedQuestions,
      attachments: req.files ? req.files.map(file => ({
        name: file.originalname,
        url: `/uploads/assignments/${file.filename}`,
        type: file.mimetype
      })) : []
    });

    console.log('Saving assignment:', assignment);
    const newAssignment = await assignment.save();
    res.status(201).json(newAssignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update assignment (protected route)
router.put('/:id', protect, upload.array('files', 5), async (req, res) => {
  try {
    console.log('Received assignment update request:', req.body);
    
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const {
      title,
      description,
      course,
      department,
      dueDate,
      totalMarks,
      instructions,
      questions
    } = req.body;

    // Validate required fields
    const requiredFields = ['title', 'description', 'course', 'department', 'dueDate', 'totalMarks', 'instructions'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Parse questions from JSON string
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (error) {
      console.error('Error parsing questions:', error);
      return res.status(400).json({ message: 'Invalid questions format' });
    }

    // Update assignment fields
    assignment.title = title;
    assignment.description = description;
    assignment.course = course;
    assignment.department = department;
    assignment.dueDate = dueDate;
    assignment.totalMarks = totalMarks;
    assignment.instructions = instructions;
    assignment.questions = parsedQuestions;

    // Add new attachments if any
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        name: file.originalname,
        url: `/uploads/assignments/${file.filename}`,
        type: file.mimetype
      }));
      assignment.attachments = [...assignment.attachments, ...newAttachments];
    }

    console.log('Saving updated assignment:', assignment);
    const updatedAssignment = await assignment.save();
    res.json(updatedAssignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete assignment (protected route)
router.delete('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Delete all graded results for this assignment
    await GradedResult.deleteMany({ assignment: req.params.id });

    // Delete the assignment
    await Assignment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Assignment and related results deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Submit assignment (protected route)
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'instructor');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user has already submitted
    const existingSubmission = assignment.submissions.find(
      submission => submission.student.toString() === req.user._id.toString()
    );

    if (existingSubmission) {
      return res.status(400).json({ 
        message: 'You have already submitted this assignment',
        submission: existingSubmission
      });
    }

    const { answers } = req.body;

    // Validate answers
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    // Validate that all answers have required fields
    const isValidAnswers = answers.every(answer => 
      typeof answer.questionId === 'number' && 
      typeof answer.answer === 'string'
    );

    if (!isValidAnswers) {
      return res.status(400).json({ message: 'Invalid answer format. Each answer must have questionId and answer.' });
    }

    // Auto-evaluate answers and calculate marks
    let totalMarks = 0;
    let earnedMarks = 0;
    let evaluatedAnswers = [];

    // Evaluate each answer
    answers.forEach((studentAnswer, index) => {
      const question = assignment.questions[index];
      const correctAnswer = question.correctAnswer;
      const studentResponse = studentAnswer.answer;

      // Validate the answer using our utility function
      const isCorrect = validateAnswer(studentResponse, correctAnswer);
      
      // Determine marks based on answer format
      let marks = 0;
      let questionFeedback = '';

      if (question.answerFormat === 'short') {
        // For short answers, use exact match
        if (isCorrect) {
          marks = question.marks;
          questionFeedback = 'Correct answer!';
        } else {
          marks = 0;
          questionFeedback = 'Incorrect answer.';
        }
      } else { // long answers
        // For long answers, use similarity check
        if (isCorrect) {
          marks = question.marks;
          questionFeedback = 'Well-written and comprehensive answer!';
        } else {
          marks = question.marks * 0.3;
          questionFeedback = 'Answer needs improvement.';
        }
      }

      // Update the answer evaluation
      evaluatedAnswers.push({
        questionId: index,
        questionText: question.text,
        questionType: question.answerFormat,
        studentAnswer: studentResponse,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        marks: marks,
        maxMarks: question.marks || 1,
        feedback: questionFeedback
      });

      // Update total marks
      earnedMarks += marks;
      totalMarks += question.marks || 1;
    });

    // Calculate percentage score
    const percentageScore = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
    
    // Scale the score to the assignment's total marks
    const scaledScore = Math.round((percentageScore / 100) * assignment.totalMarks);

    // Create submission object with evaluation results
    const submission = {
      student: req.user._id,
      answers: evaluatedAnswers,
      submittedAt: new Date(),
      evaluation: {
        totalMarks,
        earnedMarks,
        percentage: percentageScore,
        scaledScore,
        status: 'evaluated',
        evaluatedAt: new Date(),
        feedback: evaluatedAnswers.map(a => a.feedback).join('\n'),
        comments: percentageScore >= 60 ? 'Good job! You passed the assignment.' : 'Keep practicing! You can do better next time.'
      }
    };

    assignment.submissions.push(submission);
    await assignment.save();
    
    // Create GradedResult instance
    const gradedAnswers = evaluatedAnswers.map((answer, index) => {
      const question = assignment.questions[answer.questionId];
      return {
        questionId: answer.questionId,
        questionText: question.text,
        questionType: question.answerFormat,
        studentAnswer: answer.studentAnswer,
        correctAnswer: question.correctAnswer || '',
        isCorrect: answer.isCorrect,
        marks: answer.marks || 0,
        maxMarks: question.marks || 1,
        feedback: answer.feedback
      };
    });

    // Generate overall feedback based on percentage
    const overallFeedback = percentageScore >= 60
      ? `Congratulations! You scored ${percentageScore}% on this assignment. Keep up the good work!`
      : `You scored ${percentageScore}% on this assignment. Review the material and try again to improve your score.`;

    // Create graded result instance
    let gradedResult = new GradedResult({
      assignment: assignment._id,
      student: req.user._id,
      course: assignment.course._id,
      submittedAt: new Date(),
      gradedAt: new Date(),
      answers: gradedAnswers,
      totalMarks,
      earnedMarks,
      percentage: percentageScore,
      scaledScore,
      status: 'evaluated',
      overallFeedback,
      comments: percentageScore >= 60 ? 'Good job! You passed the assignment.' : 'Keep practicing! You can do better next time.'
    });

    // Save graded result
    gradedResult = await gradedResult.save();

    // Generate certificate if score is passing (60% or higher)
    if (percentageScore >= 60) {
      try {
        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({
          student: req.user._id,
          course: assignment.course._id,
          assignment: assignment._id
        });

        if (!existingCertificate) {
          const certificate = new Certificate({
            student: req.user._id,
            course: assignment.course._id,
            assignment: assignment._id,
            instructor: assignment.course.instructor,
            grade: scaledScore.toString(),
            completionDate: new Date(),
            status: 'issued',
            signature: 'Auto-generated'
          });

          const savedCertificate = await certificate.save();
          
          // Update the graded result with certificate info
          gradedResult.certificateIssued = true;
          gradedResult.certificateId = savedCertificate._id;
          await gradedResult.save();
        }
      } catch (certError) {
        console.error('Error generating certificate:', certError);
        // Don't fail the submission if certificate generation fails
      }
    }

    res.json({ 
      message: 'Assignment submitted successfully',
      submission: submission,
      gradedResultId: gradedResult._id,
      score: {
        earned: earnedMarks,
        total: totalMarks,
        percentage: percentageScore,
        scaledScore: scaledScore
      }
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(400).json({ message: error.message });
  }
});

// Evaluate student answers
router.post('/:id/evaluate', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if the user has permission to evaluate
    if (req.user.role !== 'Admin' && req.user.role !== 'Instructor') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { submissionId, answers } = req.body;
    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Initialize total marks and feedback
    let totalMarks = 0;
    let feedback = '';

    // Evaluate each answer
    answers.forEach((studentAnswer, index) => {
      const question = assignment.questions[index];
      const correctAnswer = question.correctAnswer.toLowerCase().trim();
      const studentResponse = studentAnswer.answer.toLowerCase().trim();

      // Calculate similarity score (simple string comparison)
      const similarityScore = calculateSimilarity(correctAnswer, studentResponse);
      
      // Determine marks based on answer format
      let marks = 0;
      let questionFeedback = '';

      if (question.answerFormat === 'short') {
        // For short answers, require more exact match
        if (similarityScore >= 0.8) {
          marks = question.marks;
          questionFeedback = 'Correct answer!';
        } else if (similarityScore >= 0.5) {
          marks = question.marks * 0.5;
          questionFeedback = 'Partially correct. Some key points are missing.';
        } else {
          marks = 0;
          questionFeedback = 'Incorrect answer. Please review the key concepts.';
        }
      } else { // long answers
        // For long answers, allow more leniency
        if (similarityScore >= 0.7) {
          marks = question.marks;
          questionFeedback = 'Well-written and comprehensive answer!';
        } else if (similarityScore >= 0.4) {
          marks = question.marks * 0.7;
          questionFeedback = 'Answer is good but could be more detailed.';
        } else {
          marks = question.marks * 0.3;
          questionFeedback = 'Answer needs improvement. Please elaborate more.';
        }
      }

      // Update the answer evaluation
      submission.answers[index] = {
        ...submission.answers[index],
        marks,
        feedback: questionFeedback,
        isCorrect: marks >= question.marks * 0.7
      };

      // Update total marks and feedback
      totalMarks += marks;
      feedback += `${question.text}: ${questionFeedback}\n\n`;
    });

    // Update submission evaluation
    submission.evaluation = {
      totalMarks: assignment.totalMarks,
      earnedMarks: totalMarks,
      percentage: (totalMarks / assignment.totalMarks) * 100,
      scaledScore: Math.round((totalMarks / assignment.totalMarks) * 100),
      status: 'graded',
      evaluatedBy: req.user._id,
      evaluatedAt: new Date(),
      feedback,
      comments: req.body.comments || ''
    };

    await assignment.save();
    res.status(200).json({ message: 'Assignment graded successfully', submission });
  } catch (error) {
    console.error('Error evaluating assignment:', error);
    res.status(500).json({ message: 'Error evaluating assignment' });
  }
});

// Helper function to calculate string similarity
function calculateSimilarity(str1, str2) {
  // Simple similarity calculation - you can replace this with a more sophisticated algorithm
  const set1 = new Set(str1.split(''));
  const set2 = new Set(str2.split(''));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  return intersection.size / Math.max(set1.size, set2.size);
}

// Get assignments by course
router.get('/course/:courseId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('course', 'title');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assignments by instructor
router.get('/instructor/:instructorId', async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate({
        path: 'course',
        match: { instructor: req.params.instructorId }
      })
      .populate('course', 'title');
    
    // Filter out assignments where course is null (not matching instructor)
    const filteredAssignments = assignments.filter(assignment => assignment.course);
    
    res.json(filteredAssignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 