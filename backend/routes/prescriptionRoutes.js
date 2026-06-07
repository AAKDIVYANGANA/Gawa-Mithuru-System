const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Prescription = require('../models/Prescription');

// Farmer gets their prescriptions
router.get('/', protect, authorizeRoles('farmer'), async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ farmer: req.user.id })
      .populate('cattle', 'name cattleId')
      .populate('vet', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;