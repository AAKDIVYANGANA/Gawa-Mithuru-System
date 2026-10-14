const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCattle, addCattle, updateCattle, deleteCattle,
  updateWeight, updateHeat, getLifecycle
} = require('../controllers/cattleController');
const AIRequest = require('../models/AIRequest');

router.get('/', protect, getCattle);
router.post('/', protect, addCattle);
router.put('/:id', protect, updateCattle);
router.delete('/:id', protect, deleteCattle);
router.put('/:id/weight', protect, updateWeight);
router.put('/:id/heat', protect, updateHeat);
router.get('/:id/lifecycle', protect, getLifecycle);

// Get AI record matching calf DOB for sire auto-populate
// Logic: find completed AI where aiDate <= calf DOB <= aiDate + 285 days
router.get('/:id/ai-for-calf', protect, async (req, res) => {
  try {
    const { dob } = req.query;
    if (!dob) return res.json(null);

    const calfDOB = new Date(dob);

    // Find all completed AI requests for this cow
    const aiRequests = await AIRequest.find({
      cattle: req.params.id,
      status: 'completed',
      bullId: { $exists: true, $ne: '' },
      aiDate: { $exists: true }
    }).sort({ aiDate: -1 });

    if (!aiRequests.length) return res.json(null);

    // Find AI where calfDOB is within 265-295 days after aiDate (normal gestation 280 days)
    const matched = aiRequests.find(ai => {
      const aiDate = new Date(ai.aiDate);
      const minDate = new Date(aiDate);
      const maxDate = new Date(aiDate);
      minDate.setDate(minDate.getDate() + 265);
      maxDate.setDate(maxDate.getDate() + 295);
      return calfDOB >= minDate && calfDOB <= maxDate;
    });

    // If no DOB-matched AI, return most recent AI
    res.json(matched || aiRequests[0] || null);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;