const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const authenticate = require('../middleware/auth');

router.get('/', authenticate, NotificationController.list);
router.get('/unread-count', authenticate, NotificationController.unreadCount);
router.put('/read-all', authenticate, NotificationController.markAllAsRead);
router.put('/:id/read', authenticate, NotificationController.markAsRead);

module.exports = router;
