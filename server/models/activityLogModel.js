const pool = require('../config/db');

const ActivityLogModel = {
  // Never pass passwords, tokens, or secrets into `details`.
  async log({ userId = null, action, details = null, ipAddress = null }) {
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)`,
      [userId, action, details, ipAddress]
    );
  },

  async list({ limit = 100 } = {}) {
    const [rows] = await pool.query(
      `SELECT al.*, u.full_name, u.role FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ORDER BY al.created_at DESC LIMIT ?`,
      [limit]
    );
    return rows;
  }
};

module.exports = ActivityLogModel;
