const express = require('express');
const router = express.Router();
const { addCattle, getMyCattle, updateCattle, deleteCattle } = require('../controllers/cattleController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorizeRoles('farmer'), addCattle);
router.get('/', authorizeRoles('farmer', 'ldo', 'vet'), getMyCattle);
router.put('/:id', authorizeRoles('farmer'), updateCattle);
router.delete('/:id', authorizeRoles('farmer'), deleteCattle);
// Update cattle weight
router.put('/:id/weight', authorizeRoles('farmer'), async (req, res) => {
  try {
    const { weight, girth, length } = req.body;
    let calculatedWeight = weight;
    if (girth && length) {
      const weightLbs = (girth * girth * length) / 300;
      calculatedWeight = parseFloat((weightLbs * 0.453592).toFixed(1));
    }
    const cattle = await require('../models/Cattle').findByIdAndUpdate(
      req.params.id,
      { weight: calculatedWeight, lastWeightDate: new Date() },
      { new: true }
    );
    res.json({ cattle, calculatedWeight });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Update last heat date
router.put('/:id/heat', authorizeRoles('farmer'), async (req, res) => {
  try {
    const cattle = await require('../models/Cattle').findByIdAndUpdate(
      req.params.id,
      { lastHeatDate: req.body.lastHeatDate },
      { new: true }
    );
    res.json(cattle);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
