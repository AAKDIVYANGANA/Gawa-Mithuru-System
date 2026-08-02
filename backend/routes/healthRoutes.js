const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getHealthReports,
  createHealthReport,
  updateHealthReport,
  deleteHealthReport
} = require('../controllers/healthController');

router.get('/', protect, getHealthReports);
router.post('/', protect, createHealthReport);
router.put('/:id', protect, updateHealthReport);
router.delete('/:id', protect, deleteHealthReport);

module.exports = router;