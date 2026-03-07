const express = require('express');
const router = express.Router();
const { addMilkRecord, getMilkRecords, getMilkByCattle, updateMilkRecord, deleteMilkRecord } = require('../controllers/milkController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', allowRoles('farmer'), addMilkRecord);
router.get('/', allowRoles('farmer', 'ldo', 'vet'), getMilkRecords);
router.get('/cattle/:cattleId', allowRoles('farmer', 'ldo', 'vet'), getMilkByCattle);
router.put('/:id', allowRoles('farmer'), updateMilkRecord);
router.delete('/:id', allowRoles('farmer'), deleteMilkRecord);

module.exports = router;