const mongoose = require('mongoose');

const cattleSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  cattleId: { type: String, required: true },
  breed: { type: String, required: true },
  dob: { type: Date, required: true },
  status: {
    type: String,
    enum: ['සෞඛ්‍යසම්පන්න', 'අසනීප', 'ගර්භනී', 'එන්නත් ලැබූ'],
    default: 'සෞඛ්‍යසම්පන්න'
  },
  weight: { type: Number },
  lastWeightDate: { type: Date },
  lastHeatDate: { type: Date },
  aiReadyNotified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Cattle', cattleSchema);