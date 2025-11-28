const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['library', 'lab', 'room'],
        required: true,
    },
    status: {
        type: String,
        enum: ['available', 'maintenance'],
        default: 'available',
    },
});

const bookingSchema = new mongoose.Schema({
    resource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
}, { timestamps: true });

const Resource = mongoose.model('Resource', resourceSchema);
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { Resource, Booking };
