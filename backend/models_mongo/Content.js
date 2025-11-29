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
    uploadedBy: {
        type: String, // Storing email or ID of the staff/admin
        required: true,
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
