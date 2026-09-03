const pool = require('../config/db');

const NotificationModel = {
  async create({ userId, title, message, type = 'general' }) {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
      [userId, title, message, type]
    );
  },

  async listByUser(userId) {
    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
      [userId]
    );
    return rows;
  },

  async unreadCount(userId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId]
    );
    return rows[0].cnt;
  },

  async markAsRead(id, userId) {
    await pool.query(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [id, userId]);
  },

  async markAllAsRead(userId) {
    await pool.query(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId]);
  }
};

module.exports = NotificationModel;
