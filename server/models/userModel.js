const pool = require('../config/db');

const UserModel = {
  async create({ fullName, email, phone, hashedPassword, role = 'customer' }) {
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
      [fullName, email, phone, hashedPassword, role]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async updateProfile(id, { fullName, phone, email }) {
    await pool.query(
      `UPDATE users SET full_name = ?, phone = ?, email = ? WHERE id = ?`,
      [fullName, phone, email, id]
    );
  },

  async updatePassword(id, hashedPassword) {
    await pool.query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, id]);
  },

  async setStatus(id, status) {
    await pool.query(`UPDATE users SET status = ? WHERE id = ?`, [status, id]);
  },

  async listCustomers({ search } = {}) {
    let sql = `SELECT id, full_name, email, phone, status, created_at FROM users WHERE role = 'customer'`;
    const params = [];
    if (search) {
      sql += ` AND (full_name LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY created_at DESC`;
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async counts() {
    const [rows] = await pool.query(
      `SELECT
        SUM(role = 'customer') AS totalCustomers,
        SUM(role = 'customer' AND status = 'suspended') AS suspendedCustomers
       FROM users`
    );
    return rows[0];
  }
};

module.exports = UserModel;
