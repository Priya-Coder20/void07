const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    resourceType: { type: String, enum: ['Book', 'Hostel', 'LabEquipment'], required: true },
    requestDate: { type: Date, default: Date.now },
    duration: { type: Number, required: true }, // Number of days/months/years
    period: { type: String, enum: ['days', 'months', 'years'], default: 'days' },
    quantity: { type: Number, default: 1 }, // For Lab Equipment
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
