const AIRequest = require('../models/AIRequest');

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await AIRequest.find({ farmer: req.user.id })
      .populate('cattle', 'name cattleId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addRequest = async (req, res) => {
  try {
    const { cattle, requestDate, breedPreference, notes } = req.body;
    const request = new AIRequest({
      farmer: req.user.id,
      cattle, requestDate, breedPreference, notes
    });
    await request.save();
    const populated = await request.populate('cattle', 'name cattleId');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    await AIRequest.findOneAndDelete({ _id: req.params.id, farmer: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};