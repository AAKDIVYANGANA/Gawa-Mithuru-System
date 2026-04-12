const Notification = require('../models/Notification');
const User = require('../models/User');

exports.sendAIReady = async (req, res) => {
  try {
    const { cattleId, message } = req.body;
    const ldos = await User.find({ role: 'ldo' });
    if (ldos.length === 0) return res.status(400).json({ message: 'LDO නිලධාරීන් නොමැත' });

    const notifications = ldos.map(ldo => ({
      from: req.user.id,
      to: ldo._id,
      toRole: 'ldo',
      type: 'ai_ready',
      title: '💉 AI සිංචනයට සූදානම්',
      message: message || `${req.user.fullName} ගේ ගවයා AI සිංචනයට සූදානම්`,
      cattle: cattleId || null
    }));

    await Notification.insertMany(notifications);
    res.status(201).json({ message: 'Notification යවන ලදී' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ to: req.user.id }, { toRole: req.user.role }]
    })
      .populate('from', 'fullName phone')
      .populate('cattle', 'name cattleId')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { $or: [{ to: req.user.id }, { toRole: req.user.role }], isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      $or: [{ to: req.user.id }, { toRole: req.user.role }],
      isRead: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};