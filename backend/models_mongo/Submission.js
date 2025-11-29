const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
    },
    studentId: {
        type: String, // User ID or Email
        required: true,
    },
    studentName: {
        type: String,
        required: true,
    },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId }, // If questions have IDs
        questionText: { type: String },
        answer: { type: String },
    }],
    score: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['submitted', 'graded'],
        default: 'submitted',
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Submission', submissionSchema);
