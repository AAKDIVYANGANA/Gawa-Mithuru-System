const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Farmer Register
const registerFarmer = async (req, res) => {
  try {
    const { fullName, nic, phone, address, district, password } = req.body;

    // NIC already exists check
    const nicExists = await User.findOne({ nic });
    if (nicExists) {
      return res.status(400).json({ message: 'මෙම NIC අංකය දැනටමත් ලියාපදිංචි වී ඇත' });
    }

    // Phone already exists check
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: 'මෙම දුරකථන අංකය දැනටමත් ලියාපදිංචි වී ඇත' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create farmer
    const farmer = await User.create({
      fullName,
      nic,
      phone,
      address,
      district,
      password: hashedPassword,
      role: 'farmer'
    });

    res.status(201).json({ message: 'ලියාපදිංචිය සාර්ථකයි!' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login - Farmer uses phone, LDO/Vet uses email
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by phone or email
    const user = await User.findOne({
      $or: [{ phone: identifier }, { email: identifier }]
    });

    if (!user) {
      return res.status(400).json({ message: 'පරිශීලකයා හමු නොවීය' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'මුරපදය වැරදිය' });
    }

    // Create JWT token
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
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerFarmer, login };


