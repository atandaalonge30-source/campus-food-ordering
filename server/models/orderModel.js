const pool = require('../config/db');

// Valid forward transitions for order_status. Cancellation is allowed from
// any non-terminal state; nothing is allowed to move once completed/cancelled.
const TRANSITIONS = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

function canTransition(from, to) {
  return TRANSITIONS[from] && TRANSITIONS[from].includes(to);
}

async function generateOrderNumber(conn) {
  const year = new Date().getFullYear();
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt FROM orders WHERE order_number LIKE ?`,
    [`TPI-ORD-${year}-%`]
  );
  const next = (rows[0].cnt + 1).toString().padStart(5, '0');
  return `TPI-ORD-${year}-${next}`;
}

const OrderModel = {
  canTransition,

  // items: [{ foodId, quantity, unitPrice }]
  async createOrder({ userId, vendorId, items, paymentMethod, pickupNote }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const totalAmount = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
      const orderNumber = await generateOrderNumber(conn);

      const [orderResult] = await conn.query(
        `INSERT INTO orders (order_number, user_id, vendor_id, total_amount, payment_method, pickup_note)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderNumber, userId, vendorId, totalAmount, paymentMethod, pickupNote || null]
      );
      const orderId = orderResult.insertId;

      for (const item of items) {
        const subtotal = item.unitPrice * item.quantity;
        await conn.query(
          `INSERT INTO order_items (order_id, food_id, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.foodId, item.quantity, item.unitPrice, subtotal]
        );
      }

      await conn.query(
        `INSERT INTO payments (order_id, amount, method, status) VALUES (?, ?, ?, 'pending')`,
        [orderId, totalAmount, paymentMethod]
      );

      await conn.commit();
      return { orderId, orderNumber, totalAmount };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT o.*, v.business_name, u.full_name AS customer_name, u.phone AS customer_phone, u.email AS customer_email
       FROM orders o
       JOIN vendors v ON v.id = o.vendor_id
       JOIN users u ON u.id = o.user_id
       WHERE o.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async getItems(orderId) {
    const [rows] = await pool.query(
      `SELECT oi.*, f.food_name FROM order_items oi
       JOIN foods f ON f.id = oi.food_id WHERE oi.order_id = ?`,
      [orderId]
    );
    return rows;
  },

  async listByCustomer(userId) {
    const [rows] = await pool.query(
      `SELECT o.*, v.business_name FROM orders o
       JOIN vendors v ON v.id = o.vendor_id
       WHERE o.user_id = ? ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async listByVendor(vendorId, { status } = {}) {
    let sql = `SELECT o.*, u.full_name AS customer_name, u.phone AS customer_phone
               FROM orders o JOIN users u ON u.id = o.user_id WHERE o.vendor_id = ?`;
    const params = [vendorId];
    if (status) { sql += ` AND o.order_status = ?`; params.push(status); }
    sql += ` ORDER BY o.created_at DESC`;
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async listAll({ vendorId, customerSearch, orderStatus, paymentStatus, dateFrom, dateTo } = {}) {
    let sql = `
      SELECT o.*, v.business_name, u.full_name AS customer_name
      FROM orders o
      JOIN vendors v ON v.id = o.vendor_id
      JOIN users u ON u.id = o.user_id
      WHERE 1=1`;
    const params = [];
    if (vendorId) { sql += ` AND o.vendor_id = ?`; params.push(vendorId); }
    if (customerSearch) { sql += ` AND u.full_name LIKE ?`; params.push(`%${customerSearch}%`); }
    if (orderStatus) { sql += ` AND o.order_status = ?`; params.push(orderStatus); }
    if (paymentStatus) { sql += ` AND o.payment_status = ?`; params.push(paymentStatus); }
    if (dateFrom) { sql += ` AND DATE(o.created_at) >= ?`; params.push(dateFrom); }
    if (dateTo) { sql += ` AND DATE(o.created_at) <= ?`; params.push(dateTo); }
    sql += ` ORDER BY o.created_at DESC`;
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async updateStatus(id, status, cancellationReason = null) {
    await pool.query(
      `UPDATE orders SET order_status = ?, cancellation_reason = ? WHERE id = ?`,
      [status, status === 'cancelled' ? cancellationReason : null, id]
    );
  },

  async updatePaymentStatus(id, paymentStatus) {
    await pool.query(`UPDATE orders SET payment_status = ? WHERE id = ?`, [paymentStatus, id]);
    await pool.query(`UPDATE payments SET status = ?, payment_date = IF(? = 'paid', NOW(), payment_date) WHERE order_id = ?`,
      [paymentStatus, paymentStatus, id]);
  },

  async submitBankTransferProof(orderId, { reference }) {
    await pool.query(`UPDATE payments SET reference = ? WHERE order_id = ?`, [reference, orderId]);
  },

  async vendorSalesSummary(vendorId) {
    const [[today]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) AS total FROM orders
       WHERE vendor_id = ? AND order_status = 'completed' AND DATE(created_at) = CURDATE()`,
      [vendorId]
    );
    const [[week]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) AS total FROM orders
       WHERE vendor_id = ? AND order_status = 'completed' AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)`,
      [vendorId]
    );
    const [[month]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) AS total FROM orders
       WHERE vendor_id = ? AND order_status = 'completed' AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())`,
      [vendorId]
    );
    const [[allTime]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) AS total, SUM(order_status='completed') AS completedCount, SUM(order_status='cancelled') AS cancelledCount
       FROM orders WHERE vendor_id = ? AND order_status = 'completed'`,
      [vendorId]
    );
    const [statusCounts] = await pool.query(
      `SELECT order_status, COUNT(*) AS cnt FROM orders WHERE vendor_id = ? GROUP BY order_status`,
      [vendorId]
    );
    return {
      todaySales: today.total,
      weekSales: week.total,
      monthSales: month.total,
      totalSales: allTime.total,
      statusCounts
    };
  },

  async adminDashboardCounts() {
    const [[orderCounts]] = await pool.query(
      `SELECT COUNT(*) AS totalOrders,
              SUM(order_status='pending') AS pendingOrders,
              SUM(order_status='completed') AS completedOrders,
              SUM(order_status='cancelled') AS cancelledOrders
       FROM orders`
    );
    const [[salesTotals]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) AS totalSales, COUNT(*) AS totalTransactions
       FROM orders WHERE order_status = 'completed'`
    );
    return { ...orderCounts, ...salesTotals };
  },

  async recentActivityOrders(limit = 8) {
    const [rows] = await pool.query(
      `SELECT o.order_number, o.order_status, o.created_at, v.business_name, u.full_name AS customer_name
       FROM orders o JOIN vendors v ON v.id = o.vendor_id JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC LIMIT ?`,
      [limit]
    );
    return rows;
  }
};

module.exports = OrderModel;
