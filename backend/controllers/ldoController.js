const User = require('../models/User');
const Cattle = require('../models/Cattle');
const AIRequest = require('../models/AIRequest');
const NutritionAdvice = require('../models/NutritionAdvice');
const HealthReport = require('../models/HealthReport');
const MilkRecord = require('../models/MilkRecord');
const Vaccination = require('../models/Vaccination');

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);
    const [farmers, cattle, pendingAI, upcomingVaccinations] = await Promise.all([
      User.countDocuments({ role: 'farmer' }),
      Cattle.countDocuments(),
      AIRequest.countDocuments({ status: 'pending' }),
      Vaccination.countDocuments({ scheduledDate: { $gte: today, $lte: in7Days }, status: 'scheduled' })
    ]);
    res.json({ farmers, cattle, pendingAI, upcomingVaccinations });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('-password').sort({ createdAt: -1 });
    res.json(farmers);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getAllCattle = async (req, res) => {
  try {
    const cattle = await Cattle.find()
      .populate('farmer', 'fullName phone district')
      .populate('dam', 'name cattleId')
      .populate('offspring', 'name cattleId status')
      .sort({ createdAt: -1 });
    res.json(cattle);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getAIRequests = async (req, res) => {
  try {
    const requests = await AIRequest.find()
      .populate('farmer', 'fullName phone')
      .populate('cattle', 'name cattleId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.updateAIRequest = async (req, res) => {
  try {
    const { status, ldoNotes, bullId, semenBreed, batchNo, aiDate, pdDate } = req.body;

    const request = await AIRequest.findByIdAndUpdate(
      req.params.id,
      { status, ldoNotes, bullId, semenBreed, batchNo, aiDate, pdDate },
      { new: true }
    ).populate('farmer', 'fullName phone').populate('cattle', 'name cattleId');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    // AI complete → lifecycle event only — NO Cattle.sire update
    if (status === 'completed' && bullId) {
      await Cattle.findByIdAndUpdate(request.cattle._id, {
        $push: {
          lifecycleEvents: {
            event: 'ai',
            date: aiDate || new Date(),
            notes: `AI සිංසේචනය — Bull: ${bullId}, Breed: ${semenBreed || '-'}, Batch: ${batchNo || '-'}`
          }
        }
      });
    }

    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHealthAlerts = async (req, res) => {
  try {
    const alerts = await HealthReport.find({ isAlert: true })
      .populate('cattle', 'name cattleId')
      .populate('farmer', 'fullName phone')
      .sort({ date: -1 });
    res.json(alerts);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.sendAdvice = async (req, res) => {
  try {
    const { farmer, cattle, title, content, category } = req.body;
    const NutritionAdvice = require('../models/NutritionAdvice');
    const advice = new NutritionAdvice({ ldo: req.user.id, farmer, cattle, title, content, category });
    await advice.save();
    res.status(201).json(advice);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getVaccinations = async (req, res) => {
  try {
    const vaccinations = await Vaccination.find()
      .populate('cattle', 'name cattleId')
      .populate('farmer', 'fullName phone')
      .sort({ scheduledDate: 1 });
    res.json(vaccinations);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.addVaccination = async (req, res) => {
  try {
    const { cattle, farmer, vaccineName, scheduledDate, notes } = req.body;
    const vaccination = new Vaccination({
      cattle, farmer, vaccineName, scheduledDate, notes,
      scheduledBy: req.user.id
    });
    await vaccination.save();
    const populated = await vaccination.populate([
      { path: 'cattle', select: 'name cattleId' },
      { path: 'farmer', select: 'fullName phone' }
    ]);
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.completeVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedDate: new Date() },
      { new: true }
    ).populate('cattle', 'name cattleId').populate('farmer', 'fullName phone');
    res.json(vaccination);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getMilkAnalytics = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const records = await MilkRecord.find({ date: { $gte: sevenDaysAgo } })
      .populate('cattle', 'name cattleId')
      .populate('farmer', 'fullName phone')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getCattleHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const [cattle, health, ai, vaccinations, milk] = await Promise.all([
      Cattle.findById(id).populate('farmer', 'fullName phone'),
      HealthReport.find({ cattle: id }).sort({ date: -1 }),
      AIRequest.find({ cattle: id }).sort({ createdAt: -1 }),
      Vaccination.find({ cattle: id }).sort({ scheduledDate: -1 }),
      MilkRecord.find({ cattle: id }).sort({ date: -1 }).limit(7)
    ]);
    res.json({ cattle, health, ai, vaccinations, milk });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};