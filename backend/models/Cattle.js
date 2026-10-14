const mongoose = require('mongoose');

const cattleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cattleId: { type: String, required: true },
  breed: { type: String, required: true },
  gender: { type: String, enum: ['ගැහැණු', 'පිරිමි'], default: 'ගැහැණු' },
  dob: { type: Date },
  status: {
    type: String,
    enum: ['සෞඛ්‍යසම්පන්න', 'අසනීප', 'ගර්භනී', 'වියළී', 'මළ', 'විකිණී'],
    default: 'සෞඛ්‍යසම්පන්න'
  },

  // Pedigree — system cattle
  sire: { type: String },
  dam: { type: mongoose.Schema.Types.ObjectId, ref: 'Cattle' },
  offspring: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cattle' }],

  // Pedigree — external/manual (when parent not in system)
  sireText: { type: String, default: '' },
  damText: { type: String, default: '' },

  // Weight & AI
  weight: { type: Number },
  lastHeatDate: { type: Date },
  aiReadyNotified: { type: Boolean, default: false },

  // Pregnancy
  pregnancyDate: { type: Date },
  expectedCalvingDate: { type: Date },
  calvingDate: { type: Date },
  calvingNotes: { type: String },

  // Death
  deathDate: { type: Date },
  deathReason: { type: String },
  deathNotes: { type: String },

  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  lifecycleEvents: [{
    event: { type: String },
    date: { type: Date, default: Date.now },
    notes: { type: String }
  }]

}, { timestamps: true });

module.exports = mongoose.model('Cattle', cattleSchema);