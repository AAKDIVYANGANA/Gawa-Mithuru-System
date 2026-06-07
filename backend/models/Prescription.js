const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  cattle: { type: mongoose.Schema.Types.ObjectId, ref: 'Cattle', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vet: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis: { type: String, required: true },
  medication: { type: String, required: true },
  dosage: { type: String, required: true },
  duration: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['active', 'completed'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);