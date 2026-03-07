const mongoose = require('mongoose');

const healthReportSchema = new mongoose.Schema({
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
  temperature: { type: Number, required: true },
  symptoms: { type: String, required: true },
  notes: { type: String },
  date: { type: Date, required: true },
  isAlert: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'reviewed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('HealthReport', healthReportSchema);