const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register - Farmer
const registerFarmer = async (req, res) => {
  try {
    const { fullName, nic, phone, email, address, district, dsDivision, password, role } = req.body;

    if (!fullName) return res.status(400).json({ message: 'සම්පූර්ණ නම ඇතුළත් කරන්න' });
    if (!password) return res.status(400).json({ message: 'මුරපදය ඇතුළත් කරන්න' });

    const userRole = role || 'farmer';

    // Farmer validation
    if (userRole === 'farmer') {
      if (!nic) return res.status(400).json({ message: 'NIC අංකය ඇතුළත් කරන්න' });
      if (!phone) return res.status(400).json({ message: 'දුරකථන අංකය ඇතුළත් කරන්න' });
      if (!district) return res.status(400).json({ message: 'දිස්ත්‍රික්කය තෝරන්න' });
      if (!dsDivision) return res.status(400).json({ message: 'DS කොට්ඨාශය තෝරන්න' });

      const nicExists = await User.findOne({ nic });
      if (nicExists) return res.status(400).json({ message: 'මෙම NIC අංකය දැනටමත් ලියාපදිංචි වී ඇත' });

      const phoneExists = await User.findOne({ phone });
      if (phoneExists) return res.status(400).json({ message: 'මෙම දුරකථන අංකය දැනටමත් ලියාපදිංචි වී ඇත' });
    }

    // LDO / Vet validation
    if (userRole === 'ldo' || userRole === 'vet') {
      if (!email) return res.status(400).json({ message: 'Email ඇතුළත් කරන්න' });

      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: 'මෙම Email දැනටමත් ලියාපදිංචි වී ඇත' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullName,
      nic: nic || undefined,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
      district: district || undefined,
      dsDivision: dsDivision || undefined,
      password: hashedPassword,
      role: userRole
    });

    res.status(201).json({ message: 'ලියාපදිංචිය සාර්ථකයි!' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ phone: identifier }, { email: identifier }]
    });

    if (!user) return res.status(400).json({ message: 'පරිශීලකයා හමු නොවීය' });

    if (user.isActive === false)
      return res.status(403).json({ message: 'ගිණුම අක්‍රිය කර ඇත. Admin සම්බන්ධ කරගන්න.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'මුරපදය වැරදිය' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'පිවිසීම සාර්ථකයි!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        email: user.email,
        district: user.district,
        dsDivision: user.dsDivision
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerFarmer, login };