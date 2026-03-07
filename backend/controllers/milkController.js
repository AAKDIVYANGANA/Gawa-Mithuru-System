const MilkRecord = require('../models/MilkRecord');

const addMilkRecord = async (req, res) => {
  try {
    const { cattle, morningMilk, eveningMilk, date } = req.body;
    
    const totalMilk = parseFloat(morningMilk) + parseFloat(eveningMilk);
    
    const record = new MilkRecord({
      farmer: req.user.id,
      cattle,
      morningMilk: parseFloat(morningMilk),
      eveningMilk: parseFloat(eveningMilk),
      totalMilk,
      date
    });

    await record.save();
    
    res.status(201).json({ message: 'කිරි දත්ත සුරකින ලදී!', record });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const getMilkRecords = async (req, res) => {
  try {
    const records = await MilkRecord.find({ farmer: req.user.id })
      .populate('cattle', 'name cattleId')
      .sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const getMilkByCattle = async (req, res) => {
  try {
    const records = await MilkRecord.find({
      farmer: req.user.id,
      cattle: req.params.cattleId
    }).sort({ date: 1 }).limit(7);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};
const updateMilkRecord = async (req, res) => {
  try {
    const { morningMilk, eveningMilk } = req.body;
    const totalMilk = parseFloat(morningMilk) + parseFloat(eveningMilk);
    const record = await MilkRecord.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      { ...req.body, totalMilk },
      { new: true }
    );
    if (!record) return res.status(404).json({ message: 'වාර්තාව හමු නොවීය' });
    res.status(200).json({ message: 'යාවත්කාලීන කරන ලදී!', record });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

const deleteMilkRecord = async (req, res) => {
  try {
    await MilkRecord.findOneAndDelete({ _id: req.params.id, farmer: req.user.id });
    res.status(200).json({ message: 'ඉවත් කරන ලදී!' });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

module.exports = { addMilkRecord, getMilkRecords, getMilkByCattle, updateMilkRecord, deleteMilkRecord };