const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['schedule', 'material', 'announcement'],
        required: true,
    },
    eventType: {
        type: String,
        enum: ['lecture', 'quiz', 'test'],
        default: 'lecture',
    },
    uploadedBy: {
        type: String, // Storing email or ID of the staff/admin
        required: true,
    },
    fileUrl: {
        type: String,
    },
    scheduledDate: {
        type: Date,
    },
    link: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Content', contentSchema);
