const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyRequests, addRequest, deleteRequest } = require('../controllers/aiRequestController');

router.get('/', protect, getMyRequests);
router.post('/', protect, addRequest);
router.delete('/:id', protect, deleteRequest);

module.exports = router;