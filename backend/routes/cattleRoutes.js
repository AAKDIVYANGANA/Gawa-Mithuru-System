const express = require('express');
const router = express.Router();
const { addCattle, getMyCattle, updateCattle, deleteCattle } = require('../controllers/cattleController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', allowRoles('farmer'), addCattle);
router.get('/', allowRoles('farmer', 'ldo', 'vet'), getMyCattle);
router.put('/:id', allowRoles('farmer'), updateCattle);
router.delete('/:id', allowRoles('farmer'), deleteCattle);

module.exports = router;