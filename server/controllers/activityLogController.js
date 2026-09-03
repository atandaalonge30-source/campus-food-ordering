const ActivityLogModel = require('../models/activityLogModel');

const ActivityLogController = {
  // GET /api/admin/activity-logs
  async list(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 200;
      const logs = await ActivityLogModel.list({ limit });
      res.json({ success: true, logs });
    } catch (err) { next(err); }
  }
};

module.exports = ActivityLogController;
