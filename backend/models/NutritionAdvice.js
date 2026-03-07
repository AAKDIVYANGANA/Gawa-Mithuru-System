const mongoose = require('mongoose');

const nutritionAdviceSchema = new mongoose.Schema({
  ldo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ['පෝෂණය', 'සෞඛ්‍යය', 'කිරි නිෂ්පාදනය', 'අනෙකුත්'],
    default: 'අනෙකුත්'
  },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('NutritionAdvice', nutritionAdviceSchema);