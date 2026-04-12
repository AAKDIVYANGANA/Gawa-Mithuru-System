const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendAIReady,
  getMyNotifications,
  markRead,
  markAllRead,
  getUnreadCount
} = require('../controllers/notificationController');

router.post('/ai-ready', protect, sendAIReady);
router.get('/', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/mark-all-read', protect, markAllRead);
router.put('/:id/read', protect, markRead);

module.exports = router;