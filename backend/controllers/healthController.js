const HealthReport = require('../models/HealthReport');
const Notification = require('../models/Notification');
const Cattle = require('../models/Cattle');
const User = require('../models/User');

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

exports.createHealthReport = async (req, res) => {
  try {
    const { cattle, date, temperature, symptoms, notes } = req.body;

    if (!cattle) return res.status(400).json({ message: 'ගවයා තෝරන්න' });
    if (!temperature) return res.status(400).json({ message: 'උෂ්ණත්වය ඇතුළත් කරන්න' });
    if (!symptoms) return res.status(400).json({ message: 'රෝග ලක්ෂණ ඇතුළත් කරන්න' });

    const isAlert = parseFloat(temperature) > 39.5;

    const report = await HealthReport.create({
      cattle,
      farmer: req.user.id,
      date: date || new Date(),
      temperature,
      symptoms,
      notes,
      isAlert,
      status: 'pending'
    });

    if (isAlert) {
      const [farmer, cattleDoc] = await Promise.all([
        User.findById(req.user.id)
          .populate('assignedVet', '_id')
          .populate('assignedLDO', '_id'),
        Cattle.findById(cattle).select('name cattleId')
      ]);

      const title = '🚨 හදිසි සෞඛ්‍ය අනතුරු ඇඟවීම';
      const message = `${req.user.fullName} ගේ ${cattleDoc?.name || 'ගවයා'} (${cattleDoc?.cattleId || ''}) — උෂ්ණත්වය: ${temperature}°C — ${symptoms}`;

      if (farmer?.assignedVet?._id) {
        await Notification.create({
          from: req.user.id,
          to: farmer.assignedVet._id,
          toRole: 'vet',
          type: 'health_alert',
          title,
          message,
          cattle
        });
      } else {
        const vets = await User.find({ role: 'vet', isActive: { $ne: false } });
        if (vets.length > 0) {
          await Notification.insertMany(vets.map(vet => ({
            from: req.user.id,
            to: vet._id,
            toRole: 'vet',
            type: 'health_alert',
            title,
            message,
            cattle
          })));
        }
      }

      if (farmer?.assignedLDO?._id) {
        await Notification.create({
          from: req.user.id,
          to: farmer.assignedLDO._id,
          toRole: 'ldo',
          type: 'health_alert',
          title: '⚠️ සෞඛ්‍ය අනතුරු ඇඟවීම',
          message,
          cattle
        });
      }
    }

    res.status(201).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateHealthReport = async (req, res) => {
  try {
    const { temperature, symptoms, notes, date } = req.body;
    const isAlert = parseFloat(temperature) > 39.5;

    const report = await HealthReport.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      { temperature, symptoms, notes, date, isAlert },
      { new: true }
    ).populate('cattle', 'name cattleId');

    if (!report) return res.status(404).json({ message: 'Report not found' });
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