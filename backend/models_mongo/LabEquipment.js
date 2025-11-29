const mongoose = require('mongoose');

const labEquipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    totalQuantity: { type: Number, required: true, min: 0 },
    quantityBooked: { type: Number, default: 0, min: 0 },
    finePerDay: { type: Number, default: 0 },
    totalFine: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('LabEquipment', labEquipmentSchema);
