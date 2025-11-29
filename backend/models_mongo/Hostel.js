const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
    blockNumber: { type: String, required: true },
    roomNumber: { type: String, required: true },
    type: { type: String, enum: ['single', 'double'], required: true },
    costPerPeriod: { type: Number, required: true },
    period: { type: String, enum: ['night', 'month', 'year'], required: true },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Hostel', hostelSchema);
