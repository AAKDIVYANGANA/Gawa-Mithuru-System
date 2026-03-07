const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
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
  vaccineName: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  completedDate: { type: Date },
  notified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Vaccination', vaccinationSchema);