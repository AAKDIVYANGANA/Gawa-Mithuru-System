const HealthReport = require('../models/HealthReport');
const Cattle = require('../models/Cattle');
const User = require('../models/User');
const Prescription = require('../models/Prescription');

// Get all health alerts
exports.getHealthAlerts = async (req, res) => {
  try {
    const alerts = await HealthReport.find({ isAlert: true })
      .populate('cattle', 'name cattleId breed status')
      .populate('farmer', 'fullName phone district')
      .sort({ date: -1 });
    res.json(alerts);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Get all health reports
exports.getAllHealthReports = async (req, res) => {
  try {
    const reports = await HealthReport.find()
      .populate('cattle', 'name cattleId breed status')
      .populate('farmer', 'fullName phone district')
      .sort({ date: -1 });
    res.json(reports);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Update health report status (reviewed)
exports.reviewHealthReport = async (req, res) => {
  try {
    const report = await HealthReport.findByIdAndUpdate(
      req.params.id,
      { status: 'reviewed' },
      { new: true }
    ).populate('cattle', 'name cattleId').populate('farmer', 'fullName phone');
    res.json(report);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Get all cattle
exports.getAllCattle = async (req, res) => {
  try {
    const cattle = await Cattle.find()
      .populate('farmer', 'fullName phone district')
      .sort({ createdAt: -1 });
    res.json(cattle);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Get cattle full history
exports.getCattleHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const [cattle, health] = await Promise.all([
      Cattle.findById(id).populate('farmer', 'fullName phone'),
      HealthReport.find({ cattle: id }).sort({ date: -1 })
    ]);
    if (!cattle) return res.status(404).json({ message: 'Cattle not found' });
    res.json({ cattle, health });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Get prescriptions
exports.getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('cattle', 'name cattleId')
      .populate('farmer', 'fullName phone')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Add prescription
exports.addPrescription = async (req, res) => {
  try {
    const { cattle, farmer, diagnosis, medication, dosage, duration, notes } = req.body;
    const prescription = new Prescription({
      cattle, farmer, vet: req.user.id,
      diagnosis, medication, dosage, duration, notes
    });
    await prescription.save();
    const populated = await prescription.populate([
      { path: 'cattle', select: 'name cattleId' },
      { path: 'farmer', select: 'fullName phone' }
    ]);
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// Dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [totalAlerts, pendingReviews, totalCattle, totalPrescriptions] = await Promise.all([
      HealthReport.countDocuments({ isAlert: true }),
      HealthReport.countDocuments({ isAlert: true, status: 'pending' }),
      Cattle.countDocuments(),
      Prescription.countDocuments()
    ]);
    res.json({ totalAlerts, pendingReviews, totalCattle, totalPrescriptions });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};