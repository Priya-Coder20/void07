const mongoose = require('mongoose');

const managedBySchema = new mongoose.Schema({
    staffEmail: { type: String, required: true, unique: true },
    resources: [{
        resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
        resourceType: { type: String, enum: ['Book', 'Hostel', 'LabEquipment'], required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('ManagedBy', managedBySchema);
