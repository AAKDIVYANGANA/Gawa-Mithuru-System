const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyAdvice, markRead } = require('../controllers/adviceController');

router.get('/', protect, getMyAdvice);
router.put('/:id/read', protect, markRead);

module.exports = router;