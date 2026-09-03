const pool = require('../config/db');

const CategoryModel = {
  async create({ vendorId, categoryName, description }) {
    const [result] = await pool.query(
      `INSERT INTO categories (vendor_id, category_name, description) VALUES (?, ?, ?)`,
      [vendorId, categoryName, description || null]
    );
    return result.insertId;
  },

  async listByVendor(vendorId) {
    const [rows] = await pool.query(
      `SELECT * FROM categories WHERE vendor_id = ? ORDER BY category_name ASC`,
      [vendorId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM categories WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async update(id, { categoryName, description }) {
    await pool.query(
      `UPDATE categories SET category_name = ?, description = ? WHERE id = ?`,
      [categoryName, description || null, id]
    );
  },

  async remove(id) {
    await pool.query(`DELETE FROM categories WHERE id = ?`, [id]);
  },

  async foodCount(id) {
    const [rows] = await pool.query(`SELECT COUNT(*) AS cnt FROM foods WHERE category_id = ?`, [id]);
    return rows[0].cnt;
  }
};

module.exports = CategoryModel;
