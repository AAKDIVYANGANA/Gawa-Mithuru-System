const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  vet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cattle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cattle',
    required: true
  },
  diagnosis: { type: String, required: true },
  medicine: { type: String, required: true },
  dosage: { type: String, required: true },
  duration: { type: String, required: true },
  withdrawal: { type: String },
  followUp: { type: String },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);