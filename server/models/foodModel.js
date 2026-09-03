const pool = require('../config/db');

const FoodModel = {
  async create({ vendorId, categoryId, foodName, description, price, image }) {
    const [result] = await pool.query(
      `INSERT INTO foods (vendor_id, category_id, food_name, description, price, image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [vendorId, categoryId || null, foodName, description || null, price, image || null]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT f.*, v.business_name, c.category_name
       FROM foods f
       JOIN vendors v ON v.id = f.vendor_id
       LEFT JOIN categories c ON c.id = f.category_id
       WHERE f.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async listByVendor(vendorId) {
    const [rows] = await pool.query(
      `SELECT f.*, c.category_name FROM foods f
       LEFT JOIN categories c ON c.id = f.category_id
       WHERE f.vendor_id = ? ORDER BY f.created_at DESC`,
      [vendorId]
    );
    return rows;
  },

  // Public browsing: only foods belonging to approved vendors
  async listPublic({ search, vendorId, categoryId, onlyAvailable } = {}) {
    let sql = `
      SELECT f.*, v.business_name, v.campus_location, c.category_name
      FROM foods f
      JOIN vendors v ON v.id = f.vendor_id
      LEFT JOIN categories c ON c.id = f.category_id
      WHERE v.approval_status = 'approved'`;
    const params = [];
    if (search) { sql += ` AND f.food_name LIKE ?`; params.push(`%${search}%`); }
    if (vendorId) { sql += ` AND f.vendor_id = ?`; params.push(vendorId); }
    if (categoryId) { sql += ` AND f.category_id = ?`; params.push(categoryId); }
    if (onlyAvailable) { sql += ` AND f.availability = 'available'`; }
    sql += ` ORDER BY f.created_at DESC`;
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async update(id, { categoryId, foodName, description, price, availability }) {
    await pool.query(
      `UPDATE foods SET category_id = ?, food_name = ?, description = ?, price = ?, availability = ? WHERE id = ?`,
      [categoryId || null, foodName, description || null, price, availability, id]
    );
  },

  async updateImage(id, image) {
    await pool.query(`UPDATE foods SET image = ? WHERE id = ?`, [image, id]);
  },

  async setAvailability(id, availability) {
    await pool.query(`UPDATE foods SET availability = ? WHERE id = ?`, [availability, id]);
  },

  async remove(id) {
    await pool.query(`DELETE FROM foods WHERE id = ?`, [id]);
  },

  async isReferencedInOrders(id) {
    const [rows] = await pool.query(`SELECT COUNT(*) AS cnt FROM order_items WHERE food_id = ?`, [id]);
    return rows[0].cnt > 0;
  },

  async counts(vendorId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS totalFoods, SUM(availability = 'available') AS availableFoods
       FROM foods WHERE vendor_id = ?`,
      [vendorId]
    );
    return rows[0];
  },

  async adminCounts() {
    const [rows] = await pool.query(`SELECT COUNT(*) AS totalFoods FROM foods`);
    return rows[0];
  }
};

module.exports = FoodModel;
