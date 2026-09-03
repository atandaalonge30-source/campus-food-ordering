const NotificationModel = require('../models/notificationModel');

const NotificationController = {
  // GET /api/notifications
  async list(req, res, next) {
    try {
      const notifications = await NotificationModel.listByUser(req.user.id);
      const unreadCount = await NotificationModel.unreadCount(req.user.id);
      res.json({ success: true, notifications, unreadCount });
    } catch (err) { next(err); }
  },

  // GET /api/notifications/unread-count
  async unreadCount(req, res, next) {
    try {
      const count = await NotificationModel.unreadCount(req.user.id);
      res.json({ success: true, unreadCount: count });
    } catch (err) { next(err); }
  },

  // PUT /api/notifications/:id/read
  async markAsRead(req, res, next) {
    try {
      await NotificationModel.markAsRead(req.params.id, req.user.id);
      res.json({ success: true, message: 'Notification marked as read.' });
    } catch (err) { next(err); }
  },

  // PUT /api/notifications/read-all
  async markAllAsRead(req, res, next) {
    try {
      await NotificationModel.markAllAsRead(req.user.id);
      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err) { next(err); }
  }
};

module.exports = NotificationController;
