const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    department: {
        type: String,
        enum: ['CSE', 'EEE', 'MECH'],
        required: [true, 'Please provide a department'],
        default: 'CSE'
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    meetingLink: {
        type: String,
        required: true
    },
    maxParticipants: {
        type: Number,
        required: true,
        min: [1, 'Maximum participants must be at least 1']
    },
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    recordingUrl: {
        type: String
    },
    materials: [{
        name: String,
        url: String,
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('LiveClass', liveClassSchema); 