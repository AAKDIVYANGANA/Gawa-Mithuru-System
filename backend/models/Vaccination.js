const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  cattle: { type: mongoose.Schema.Types.ObjectId, ref: 'Cattle', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vaccineName: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  completedDate: { type: Date },
  status: { type: String, enum: ['scheduled', 'completed', 'missed'], default: 'scheduled' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Vaccination', vaccinationSchema);