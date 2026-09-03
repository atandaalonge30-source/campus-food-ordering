const pool = require('../config/db');

const PaymentModel = {
  async listAll() {
    const [rows] = await pool.query(
      `SELECT p.*, o.order_number, o.vendor_id, v.business_name, u.full_name AS customer_name
       FROM payments p
       JOIN orders o ON o.id = p.order_id
       JOIN vendors v ON v.id = o.vendor_id
       JOIN users u ON u.id = o.user_id
       ORDER BY p.created_at DESC`
    );
    return rows;
  },

  async findByOrderId(orderId) {
    const [rows] = await pool.query(`SELECT * FROM payments WHERE order_id = ? LIMIT 1`, [orderId]);
    return rows[0] || null;
  }
};

module.exports = PaymentModel;
