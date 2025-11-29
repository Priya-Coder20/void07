const mongoose = require('mongoose');

const bookedBySchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    resourceType: { type: String, enum: ['Book', 'Hostel', 'LabEquipment'], required: true },
    requestDate: { type: Date, default: Date.now },
    duration: { type: Number, required: true }, // Number of days/months/years
    period: { type: String, enum: ['days', 'months', 'years'], default: 'days' },
    startDate: { type: Date }, // Set on approval
    endDate: { type: Date }, // Set on approval
    returnDate: { type: Date },
    finePerDay: { type: Number, default: 0 },
    totalFine: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'returned'], default: 'pending' },
    quantity: { type: Number, default: 1 }, // For Lab Equipment
}, { timestamps: true });

module.exports = mongoose.model('BookedBy', bookedBySchema);
