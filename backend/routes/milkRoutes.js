const express = require('express');
const router = express.Router();
const { addMilkRecord, getMilkRecords, getMilkByCattle, updateMilkRecord, deleteMilkRecord } = require('../controllers/milkController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', authorizeRoles('farmer'), addMilkRecord);
router.get('/', authorizeRoles('farmer', 'ldo', 'vet'), getMilkRecords);
router.get('/cattle/:cattleId', authorizeRoles('farmer', 'ldo', 'vet'), getMilkByCattle);
router.put('/:id', authorizeRoles('farmer'), updateMilkRecord);
router.delete('/:id', authorizeRoles('farmer'), deleteMilkRecord);

module.exports = router;