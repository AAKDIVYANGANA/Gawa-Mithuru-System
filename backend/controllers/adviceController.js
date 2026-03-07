const NutritionAdvice = require('../models/NutritionAdvice');

// Farmer gets their advice
exports.getMyAdvice = async (req, res) => {
  try {
    const advice = await NutritionAdvice.find({ farmer: req.user.id })
      .populate('ldo', 'fullName')
      .sort({ createdAt: -1 });
    res.json(advice);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark as read
exports.markRead = async (req, res) => {
  try {
    await NutritionAdvice.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};