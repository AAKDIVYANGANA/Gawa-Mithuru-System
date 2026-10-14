const Cattle = require('../models/Cattle');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getCattle = async (req, res) => {
  try {
    const cattle = await Cattle.find({ farmer: req.user.id })
      .populate('dam', 'name cattleId')
      .populate('offspring', 'name cattleId status')
      .sort({ createdAt: -1 });
    res.json(cattle);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.addCattle = async (req, res) => {
  try {
    const {
      name, cattleId, breed, gender, dob, status,
      sire, sireText, dam, damText, weight
    } = req.body;

    const exists = await Cattle.findOne({ cattleId, farmer: req.user.id });
    if (exists) return res.status(400).json({ message: 'මෙම Tag No දැනටමත් ලියාපදිංචි වී ඇත' });

    const cattle = await Cattle.create({
      name, cattleId, breed,
      gender: gender || 'ගැහැණු',
      dob,
      status: status || 'සෞඛ්‍යසම්පන්න',
      sire: sire || '',
      sireText: sireText || '',
      dam: dam || null,
      damText: damText || '',
      weight,
      farmer: req.user.id,
      lifecycleEvents: [{
        event: 'born',
        date: dob || new Date(),
        notes: 'ලියාපදිංචි කරන ලදී'
      }]
    });

    if (dam) {
      await Cattle.findByIdAndUpdate(dam, { $push: { offspring: cattle._id } });
    }

    res.status(201).json(cattle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCattle = async (req, res) => {
  try {
    const {
      name, breed, gender, dob, status,
      sire, sireText, dam, damText, weight,
      pregnancyDate, expectedCalvingDate,
      calvingDate, calvingNotes,
      deathDate, deathReason, deathNotes
    } = req.body;

    const existing = await Cattle.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!existing) return res.status(404).json({ message: 'Cattle not found' });

    const updateData = {
      name, breed, gender, dob,
      sire: sire !== undefined ? sire : (existing.sire || ''),
      sireText: sireText !== undefined ? sireText : (existing.sireText || ''),
      damText: damText !== undefined ? damText : (existing.damText || ''),
    };
    if (weight) updateData.weight = weight;

    const lifecycleEvents = [];

    if (status && status !== existing.status) {
      updateData.status = status;

      if (status === 'ගර්භනී') {
        const pDate = pregnancyDate ? new Date(pregnancyDate) : new Date();
        const expectedDate = new Date(pDate);
        expectedDate.setDate(expectedDate.getDate() + 280);
        updateData.pregnancyDate = pDate;
        updateData.expectedCalvingDate = expectedCalvingDate || expectedDate;
        lifecycleEvents.push({
          event: 'pregnant',
          date: pDate,
          notes: `ගර්භනී — අපේක්ෂිත දිනය: ${expectedDate.toISOString().split('T')[0]}`
        });

        const farmer = await User.findById(req.user.id).populate('assignedLDO', '_id');
        if (farmer?.assignedLDO?._id) {
          await Notification.create({
            from: req.user.id,
            to: farmer.assignedLDO._id,
            toRole: 'ldo',
            type: 'general',
            title: '🐄 ගර්භනී දැනුම්දීම',
            message: `${req.user.fullName} ගේ ${existing.name} (${existing.cattleId}) ගර්භනී වී ඇත. අපේක්ෂිත ප්‍රසූති දිනය: ${expectedDate.toISOString().split('T')[0]}`,
            cattle: existing._id
          });
        }
      }

      if (status === 'සෞඛ්‍යසම්පන්න' && existing.status === 'ගර්භනී') {
        updateData.calvingDate = calvingDate || new Date();
        updateData.pregnancyDate = null;
        updateData.expectedCalvingDate = null;
        lifecycleEvents.push({
          event: 'calved',
          date: calvingDate || new Date(),
          notes: calvingNotes || 'ප්‍රසූතිය සාර්ථකයි'
        });
      }

      if (status === 'මළ') {
        updateData.deathDate = deathDate || new Date();
        updateData.deathReason = deathReason || '';
        updateData.deathNotes = deathNotes || '';
        lifecycleEvents.push({
          event: 'died',
          date: deathDate || new Date(),
          notes: `${deathReason || ''} — ${deathNotes || ''}`
        });
      }
    }

    // Dam change
    const newDam = dam !== undefined ? (dam || null) : existing.dam;
    const oldDam = existing.dam?.toString();
    const newDamStr = newDam?.toString();
    if (newDamStr !== oldDam) {
      updateData.dam = newDam;
      if (newDam) await Cattle.findByIdAndUpdate(newDam, { $push: { offspring: existing._id } });
      if (oldDam) await Cattle.findByIdAndUpdate(oldDam, { $pull: { offspring: existing._id } });
    }

    if (pregnancyDate) updateData.pregnancyDate = pregnancyDate;
    if (expectedCalvingDate) updateData.expectedCalvingDate = expectedCalvingDate;
    if (calvingDate) updateData.calvingDate = calvingDate;
    if (calvingNotes) updateData.calvingNotes = calvingNotes;
    if (deathDate) updateData.deathDate = deathDate;
    if (deathReason) updateData.deathReason = deathReason;
    if (deathNotes) updateData.deathNotes = deathNotes;

    if (lifecycleEvents.length > 0) {
      updateData.$push = { lifecycleEvents: { $each: lifecycleEvents } };
    }

    const cattle = await Cattle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate('dam', 'name cattleId')
      .populate('offspring', 'name cattleId status');

    res.json(cattle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCattle = async (req, res) => {
  try {
    const cattle = await Cattle.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!cattle) return res.status(404).json({ message: 'Cattle not found' });
    if (cattle.dam) {
      await Cattle.findByIdAndUpdate(cattle.dam, { $pull: { offspring: cattle._id } });
    }
    await Cattle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.updateWeight = async (req, res) => {
  try {
    const { weight } = req.body;
    const cattle = await Cattle.findByIdAndUpdate(req.params.id, { weight }, { new: true });
    res.json(cattle);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.updateHeat = async (req, res) => {
  try {
    const { lastHeatDate } = req.body;
    const cattle = await Cattle.findByIdAndUpdate(
      req.params.id,
      { lastHeatDate, aiReadyNotified: false },
      { new: true }
    );
    res.json(cattle);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

exports.getLifecycle = async (req, res) => {
  try {
    const cattle = await Cattle.findOne({ _id: req.params.id })
      .populate('farmer', 'fullName phone')
      .populate('dam', 'name cattleId breed dob')
      .populate('offspring', 'name cattleId breed status dob');
    if (!cattle) return res.status(404).json({ message: 'Cattle not found' });
    res.json(cattle);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};