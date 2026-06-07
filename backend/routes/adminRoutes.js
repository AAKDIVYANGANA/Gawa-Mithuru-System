const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const admin = require('../controllers/adminController');

const adminOnly = [protect, authorizeRoles('admin')];

router.get('/locations', admin.getLocations);
router.get('/stats', ...adminOnly, admin.getStats);
router.get('/ldos', ...adminOnly, admin.getLDOs);
router.get('/vets', ...adminOnly, admin.getVets);
router.get('/farmers', ...adminOnly, admin.getFarmers);
router.post('/ldo', ...adminOnly, admin.registerLDO);
router.post('/vet', ...adminOnly, admin.registerVet);
router.put('/users/:id/assignment', ...adminOnly, admin.updateAssignment);
router.put('/users/:id/toggle', ...adminOnly, admin.toggleActive);
router.delete('/users/:id', ...adminOnly, admin.deleteUser);

module.exports = router;