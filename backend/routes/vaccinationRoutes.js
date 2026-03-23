const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Vaccination = require('../models/Vaccination');
const Cattle = require('../models/Cattle');

router.get('/', protect, authorizeRoles('farmer'), async (req, res) => {
  try {
    const cattle = await Cattle.find({ farmer: req.user.id });
    const cattleIds = cattle.map(c => c._id);
    const vaccinations = await Vaccination.find({ cattle: { $in: cattleIds } })
      .populate('cattle', 'name cattleId')
      .sort({ scheduledDate: 1 });
    res.json(vaccinations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;