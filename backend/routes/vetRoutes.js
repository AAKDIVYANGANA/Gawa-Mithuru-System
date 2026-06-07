const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const vet = require('../controllers/vetController');

router.get('/stats', protect, authorizeRoles('vet'), vet.getStats);
router.get('/health-alerts', protect, authorizeRoles('vet'), vet.getHealthAlerts);
router.get('/health-reports', protect, authorizeRoles('vet'), vet.getAllHealthReports);
router.put('/health-reports/:id/review', protect, authorizeRoles('vet'), vet.reviewHealthReport);
router.get('/cattle', protect, authorizeRoles('vet'), vet.getAllCattle);
router.get('/cattle/:id/history', protect, authorizeRoles('vet'), vet.getCattleHistory);
router.get('/prescriptions', protect, authorizeRoles('vet'), vet.getPrescriptions);
router.post('/prescriptions', protect, authorizeRoles('vet'), vet.addPrescription);

module.exports = router;