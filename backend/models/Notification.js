const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toRole: { type: String, enum: ['ldo', 'vet', 'farmer'] },
  type: { type: String, enum: ['ai_ready', 'health_alert', 'vaccination_due', 'general'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  cattle: { type: mongoose.Schema.Types.ObjectId, ref: 'Cattle' },
  isRead: { type: Boolean, default: false },
  data: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);