const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        enum: ['schedule', 'material', 'announcement'],
        required: true,
    },
    fileUrl: {
        type: String,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetAudience: {
        type: [String], // ['student', 'staff']
        default: ['student'],
    },
}, { timestamps: true });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
