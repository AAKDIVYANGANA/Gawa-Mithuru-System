const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { registerFarmer, login } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Register
router.post('/register', registerFarmer);

// Login
router.post('/login', login);

// Update Profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, address, district, phone } = req.body;

    if (!fullName) return res.status(400).json({ message: 'සම්පූර්ණ නම ඇතුළත් කරන්න' });

    // Phone change — check duplicate & validate
    if (phone && phone !== req.user.phone) {
      if (!/^0[0-9]{9}$/.test(phone)) {
        return res.status(400).json({ message: 'දුරකථන අංකය වලංගු නැත - උදා: 0771234567' });
      }
      const phoneExists = await User.findOne({ phone, _id: { $ne: req.user.id } });
      if (phoneExists) {
        return res.status(400).json({ message: 'මෙම දුරකථන අංකය දැනටමත් ලියාපදිංචි වී ඇත' });
      }
    }

    const updateData = { fullName, address, district };
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change Password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) return res.status(400).json({ message: 'වර්තමාන මුරපදය ඇතුළත් කරන්න' });
    if (!newPassword) return res.status(400).json({ message: 'නව මුරපදය ඇතුළත් කරන්න' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'නව මුරපදය අවම අකුරු 6ක් විය යුතුය' });

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'වර්තමාන මුරපදය වැරදිය' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'මුරපදය සාර්ථකව වෙනස් කරන ලදී' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
