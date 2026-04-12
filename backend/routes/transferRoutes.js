const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const Cattle = require('../models/Cattle');
const User = require('../models/User');
const CattleTransfer = require('../models/CattleTransfer');
const Notification = require('../models/Notification');

// Get transfer history for farmer
router.get('/', protect, authorizeRoles('farmer'), async (req, res) => {
  try {
    const transfers = await CattleTransfer.find({
      $or: [{ fromFarmer: req.user.id }, { toFarmer: req.user.id }]
    })
      .populate('cattle', 'name cattleId breed')
      .populate('fromFarmer', 'fullName phone')
      .populate('toFarmer', 'fullName phone')
      .sort({ createdAt: -1 });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Find farmer by phone
router.get('/find-farmer/:phone', protect, authorizeRoles('farmer'), async (req, res) => {
  try {
    const farmer = await User.findOne({ phone: req.params.phone, role: 'farmer' }).select('-password');
    if (!farmer) return res.status(404).json({ message: 'ගොවියා හමු නොවීය' });
    if (farmer._id.toString() === req.user.id) return res.status(400).json({ message: 'ඔබට ඔබේ ගිණුමට transfer කළ නොහැක' });
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Transfer cattle
router.post('/', protect, authorizeRoles('farmer'), async (req, res) => {
  try {
    const { cattleId, toFarmerPhone, transferDate, salePrice, reason, notes } = req.body;

    // Validate cattle belongs to farmer
    const cattle = await Cattle.findOne({ _id: cattleId, farmer: req.user.id });
    if (!cattle) return res.status(404).json({ message: 'ගවයා හමු නොවීය' });

    // Find new owner
    const newOwner = await User.findOne({ phone: toFarmerPhone, role: 'farmer' });
    if (!newOwner) return res.status(404).json({ message: 'නව හිමිකරු හමු නොවීය. දුරකථන අංකය නිවැරදිද?' });
    if (newOwner._id.toString() === req.user.id) return res.status(400).json({ message: 'ඔබට ඔබේ ගිණුමට transfer කළ නොහැක' });

    // Create transfer record
    const transfer = await CattleTransfer.create({
      cattle: cattleId,
      fromFarmer: req.user.id,
      toFarmer: newOwner._id,
      transferDate: transferDate || new Date(),
      salePrice: salePrice || null,
      reason: reason || '',
      notes: notes || ''
    });

    // Update cattle owner
    await Cattle.findByIdAndUpdate(cattleId, { farmer: newOwner._id });

    // Notify LDOs
    const ldos = await User.find({ role: 'ldo' });
    if (ldos.length > 0) {
      const notifications = ldos.map(ldo => ({
        from: req.user.id,
        to: ldo._id,
        toRole: 'ldo',
        type: 'general',
        title: '🔄 ගව හිමිකාරිත්ව මාරුව',
        message: `${cattle.name} (${cattle.cattleId}) — ${req.user.fullName} ගෙන් ${newOwner.fullName} ට transfer කරන ලදී`,
        cattle: cattleId
      }));
      await Notification.insertMany(notifications);
    }

    // Notify new owner
    await Notification.create({
      from: req.user.id,
      to: newOwner._id,
      toRole: 'farmer',
      type: 'general',
      title: '🐄 ගවයෙකු ලැබුණි',
      message: `${cattle.name} (${cattle.cattleId}) ${req.user.fullName} ගෙන් ඔබට transfer කරන ලදී`,
      cattle: cattleId
    });

    const populated = await CattleTransfer.findById(transfer._id)
      .populate('cattle', 'name cattleId breed')
      .populate('fromFarmer', 'fullName phone')
      .populate('toFarmer', 'fullName phone');

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// LDO - get all transfers
router.get('/all', protect, authorizeRoles('ldo'), async (req, res) => {
  try {
    const transfers = await CattleTransfer.find()
      .populate('cattle', 'name cattleId breed')
      .populate('fromFarmer', 'fullName phone')
      .populate('toFarmer', 'fullName phone')
      .sort({ createdAt: -1 });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;