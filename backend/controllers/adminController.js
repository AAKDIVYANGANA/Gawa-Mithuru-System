const User = require('../models/User');
const bcrypt = require('bcryptjs');
const locations = require('../data/locations');

exports.getLocations = async (req, res) => {
  res.json(locations);
};

exports.getLDOs = async (req, res) => {
  try {
    const ldos = await User.find({ role: 'ldo' }).select('-password').sort({ createdAt: -1 });
    res.json(ldos);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getVets = async (req, res) => {
  try {
    const vets = await User.find({ role: 'vet' }).select('-password').sort({ createdAt: -1 });
    res.json(vets);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('-password').sort({ createdAt: -1 });
    res.json(farmers);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.registerLDO = async (req, res) => {
  try {
    const { fullName, email, phone, password, district, assignedDsDivisions } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const ldo = await User.create({
      fullName, email,
      phone: phone || undefined,
      password: hashed,
      role: 'ldo', district,
      assignedDsDivisions: assignedDsDivisions || []
    });
    res.status(201).json({ message: 'LDO registered', id: ldo._id });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.registerVet = async (req, res) => {
  try {
    const { fullName, email, phone, password, district, assignedDsDivisions } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const vet = await User.create({
      fullName, email,
      phone: phone || undefined,
      password: hashed,
      role: 'vet', district,
      assignedDsDivisions: assignedDsDivisions || []
    });
    res.status(201).json({ message: 'Vet registered', id: vet._id });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { assignedDsDivisions, district, phone } = req.body;

    const updateData = {
      assignedDsDivisions: assignedDsDivisions || [],
      district: district || ''
    };

    // Phone field — always update (even empty string to clear it)
    if (phone !== undefined && phone !== null) {
      updateData.phone = phone.trim() || undefined;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getStats = async (req, res) => {
  try {
    const [farmers, ldos, vets] = await Promise.all([
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'ldo' }),
      User.countDocuments({ role: 'vet' }),
    ]);
    res.json({ farmers, ldos, vets });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};