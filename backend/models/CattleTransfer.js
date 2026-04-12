const mongoose = require('mongoose');

const cattleTransferSchema = new mongoose.Schema({
  cattle: { type: mongoose.Schema.Types.ObjectId, ref: 'Cattle', required: true },
  fromFarmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toFarmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transferDate: { type: Date, required: true },
  salePrice: { type: Number },
  reason: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CattleTransfer', cattleTransferSchema);