const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get('/my-officers', protect, async (req, res) => {
  try {
    const farmer = await User.findById(req.user.id);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    console.log('Farmer dsDivision:', JSON.stringify(farmer.dsDivision));

    const ldo = await User.findOne({
      role: 'ldo',
      assignedDsDivisions: farmer.dsDivision,
      isActive: { $ne: false }
    }).select('fullName phone email district');

    const vet = await User.findOne({
      role: 'vet',
      assignedDsDivisions: farmer.dsDivision,
      isActive: { $ne: false }
    }).select('fullName phone email district');

    console.log('LDO found:', ldo?.fullName || 'null');
    console.log('Vet found:', vet?.fullName || 'null');

    // Auto-save
    if (ldo || vet) {
      await User.findByIdAndUpdate(farmer._id, {
        assignedLDO: ldo?._id || null,
        assignedVet: vet?._id || null
      });
    }

    res.json({ ldo, vet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;