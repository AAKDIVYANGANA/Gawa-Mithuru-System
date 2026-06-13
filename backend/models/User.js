const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  nic: { type: String },
  phone: { type: String },
  email: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'ldo', 'vet', 'admin'], required: true },
  address: { type: String },
  district: { type: String },
  dsDivision: { type: String },
  assignedDsDivisions: [{ type: String }],
  assignedLDO: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedVet: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);