const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    totalPoints: {
        type: Number,
        required: true,
    },
    questions: [{
        questionText: { type: String, required: true },
        options: [{ type: String }], // Optional for multiple choice
        correctAnswer: { type: String }, // Optional for auto-grading
        type: { type: String, enum: ['short-answer', 'multiple-choice'], default: 'short-answer' }
    }],
    createdBy: {
        type: String, // Staff ID or Email
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Assignment', assignmentSchema);
