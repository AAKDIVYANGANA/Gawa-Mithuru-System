const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const ldo = require('../controllers/ldoController');

const ldoOnly = [protect, authorizeRoles('ldo')];

router.get('/stats', ...ldoOnly, ldo.getStats);
router.get('/farmers', ...ldoOnly, ldo.getFarmers);
router.get('/cattle', ...ldoOnly, ldo.getAllCattle);
router.get('/ai-requests', ...ldoOnly, ldo.getAIRequests);
router.put('/ai-requests/:id', ...ldoOnly, ldo.updateAIRequest);
router.get('/health-alerts', ...ldoOnly, ldo.getHealthAlerts);
router.post('/advice', ...ldoOnly, ldo.sendAdvice);
router.get('/vaccinations', ...ldoOnly, ldo.getVaccinations);
router.post('/vaccinations', ...ldoOnly, ldo.addVaccination);
router.put('/vaccinations/:id/complete', ...ldoOnly, ldo.completeVaccination);
router.get('/milk-analytics', ...ldoOnly, ldo.getMilkAnalytics);
router.get('/cattle/:id/history', ...ldoOnly, ldo.getCattleHistory);

module.exports = router;