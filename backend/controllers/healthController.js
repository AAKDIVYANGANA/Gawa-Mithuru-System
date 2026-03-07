const HealthReport = require('../models/HealthReport');
const Cattle = require('../models/Cattle');

exports.getHealthReports = async (req, res) => {
  try {
    const reports = await HealthReport.find({ farmer: req.user.id })
      .populate('cattle', 'name cattleId')
      .sort({ date: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addHealthReport = async (req, res) => {
  try {
    const { cattle, date, temperature, symptoms, notes, isAlert } = req.body;
    const report = new HealthReport({
      farmer: req.user.id,
      cattle, date, temperature, symptoms, notes,
      isAlert: isAlert || false
    });
    await report.save();
    const populated = await report.populate('cattle', 'name cattleId');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateHealthReport = async (req, res) => {
  try {
    const report = await HealthReport.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      req.body,
      { new: true }
    ).populate('cattle', 'name cattleId');
    if (!report) return res.status(404).json({ message: 'Not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteHealthReport = async (req, res) => {
  try {
    await HealthReport.findOneAndDelete({ _id: req.params.id, farmer: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};