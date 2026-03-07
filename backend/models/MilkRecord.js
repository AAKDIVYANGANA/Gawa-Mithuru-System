const mongoose = require('mongoose');

const milkRecordSchema = new mongoose.Schema({
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
  morningMilk: { type: Number, required: true },
  eveningMilk: { type: Number, required: true },
  totalMilk: { type: Number },
  date: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('MilkRecord', milkRecordSchema);