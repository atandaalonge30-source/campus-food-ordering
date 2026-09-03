const pool = require('../config/db');

const VendorModel = {
  async create({ userId, businessName, campusLocation, description }) {
    const [result] = await pool.query(
      `INSERT INTO vendors (user_id, business_name, campus_location, description) VALUES (?, ?, ?, ?)`,
      [userId, businessName, campusLocation, description]
    );
    return result.insertId;
  },

  async findByUserId(userId) {
    const [rows] = await pool.query(`SELECT * FROM vendors WHERE user_id = ? LIMIT 1`, [userId]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT v.*, u.full_name AS owner_name, u.email, u.phone, u.status AS account_status
       FROM vendors v JOIN users u ON u.id = v.user_id WHERE v.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async listApproved() {
    const [rows] = await pool.query(
      `SELECT id, business_name, campus_location, description, logo, approval_status
       FROM vendors WHERE approval_status = 'approved' ORDER BY business_name ASC`
    );
    return rows;
  },

  async listAll({ status, search } = {}) {
    let sql = `SELECT v.*, u.full_name AS owner_name, u.email, u.phone
               FROM vendors v JOIN users u ON u.id = v.user_id WHERE 1=1`;
    const params = [];
    if (status) { sql += ` AND v.approval_status = ?`; params.push(status); }
    if (search) { sql += ` AND (v.business_name LIKE ? OR u.email LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    sql += ` ORDER BY v.created_at DESC`;
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async setApprovalStatus(id, status) {
    await pool.query(`UPDATE vendors SET approval_status = ? WHERE id = ?`, [status, id]);
  },

  async updateProfile(id, { businessName, campusLocation, description }) {
    await pool.query(
      `UPDATE vendors SET business_name = ?, campus_location = ?, description = ? WHERE id = ?`,
      [businessName, campusLocation, description, id]
    );
  },

  async updateLogo(id, logo) {
    await pool.query(`UPDATE vendors SET logo = ? WHERE id = ?`, [logo, id]);
  },

  async counts() {
    const [rows] = await pool.query(
      `SELECT
        COUNT(*) AS totalVendors,
        SUM(approval_status = 'pending') AS pendingVendors,
        SUM(approval_status = 'approved') AS approvedVendors,
        SUM(approval_status = 'suspended') AS suspendedVendors
       FROM vendors`
    );
    return rows[0];
  }
};

module.exports = VendorModel;
