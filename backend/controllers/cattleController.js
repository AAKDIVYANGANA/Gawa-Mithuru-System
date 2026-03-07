const Cattle = require('../models/Cattle');

const addCattle = async (req, res) => {
  try {
    const { name, cattleId, breed, dob, status } = req.body;

    const existing = await Cattle.findOne({ farmer: req.user.id, cattleId });
    if (existing) {
      return res.status(400).json({ message: `ටැග් අංකය "${cattleId}" දැනටමත් භාවිතා වේ. වෙනත් අංකයක් දමන්න.` });
    }

    const cattle = await Cattle.create({
      farmer: req.user.id,
      name, cattleId, breed, dob, status
    });
    res.status(201).json({ message: 'ගවයා එකතු කරන ලදී!', cattle });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const getMyCattle = async (req, res) => {
  try {
    const cattle = await Cattle.find({ farmer: req.user.id });
    res.status(200).json(cattle);
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const updateCattle = async (req, res) => {
  try {
    const { cattleId } = req.body;

    if (cattleId) {
      const existing = await Cattle.findOne({
        farmer: req.user.id,
        cattleId,
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({ message: `ටැග් අංකය "${cattleId}" දැනටමත් භාවිතා වේ. වෙනත් අංකයක් දමන්න.` });
      }
    }

    const cattle = await Cattle.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      req.body,
      { new: true }
    );
    if (!cattle) return res.status(404).json({ message: 'ගවයා හමු නොවීය' });
    res.status(200).json({ message: 'යාවත්කාලීන කරන ලදී!', cattle });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const deleteCattle = async (req, res) => {
  try {
    const cattle = await Cattle.findOneAndDelete({
      _id: req.params.id,
      farmer: req.user.id
    });
    if (!cattle) return res.status(404).json({ message: 'ගවයා හමු නොවීය' });
    res.status(200).json({ message: 'ගවයා ඉවත් කරන ලදී!' });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

module.exports = { addCattle, getMyCattle, updateCattle, deleteCattle };