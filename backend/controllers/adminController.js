const User = require('../models/User');
const bcrypt = require('bcryptjs');
const locations = require('../data/locations');

// Get locations data
exports.getLocations = async (req, res) => {
  res.json(locations);
};

// Get all LDOs
exports.getLDOs = async (req, res) => {
  try {
    const ldos = await User.find({ role: 'ldo' }).select('-password').sort({ createdAt: -1 });
    res.json(ldos);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Get all Vets
exports.getVets = async (req, res) => {
  try {
    const vets = await User.find({ role: 'vet' }).select('-password').sort({ createdAt: -1 });
    res.json(vets);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Get all Farmers
exports.getFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('-password').sort({ createdAt: -1 });
    res.json(farmers);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Register LDO
exports.registerLDO = async (req, res) => {
  try {
    const { fullName, email, password, district, assignedDsDivisions } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const ldo = await User.create({
      fullName, email, password: hashed,
      role: 'ldo', district,
      assignedDsDivisions: assignedDsDivisions || []
    });
    res.status(201).json({ message: 'LDO registered', id: ldo._id });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Register Vet
exports.registerVet = async (req, res) => {
  try {
    const { fullName, email, password, district, assignedDsDivisions } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const vet = await User.create({
      fullName, email, password: hashed,
      role: 'vet', district,
      assignedDsDivisions: assignedDsDivisions || []
    });
    res.status(201).json({ message: 'Vet registered', id: vet._id });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Update DS Divisions assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { assignedDsDivisions, district } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { assignedDsDivisions, district },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Deactivate user
exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Get stats
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