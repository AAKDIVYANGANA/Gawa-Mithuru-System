const express = require('express');
const router = express.Router();
const { addCattle, getMyCattle, updateCattle, deleteCattle } = require('../controllers/cattleController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorizeRoles('farmer'), addCattle);
router.get('/', authorizeRoles('farmer', 'ldo', 'vet'), getMyCattle);
router.put('/:id', authorizeRoles('farmer'), updateCattle);
router.delete('/:id', authorizeRoles('farmer'), deleteCattle);

module.exports = router;