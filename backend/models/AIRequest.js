const mongoose = require('mongoose');

const aiRequestSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cattle: { type: mongoose.Schema.Types.ObjectId, ref: 'Cattle', required: true },
  requestDate: { type: Date, required: true },
  breedPreference: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  ldoNotes: { type: String },
  bullId: { type: String },
  semenBreed: { type: String },
  batchNo: { type: String },
  aiDate: { type: Date },
  pdDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('AIRequest', aiRequestSchema);