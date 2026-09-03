const OrderModel = require('../models/orderModel');
const FoodModel = require('../models/foodModel');
const VendorModel = require('../models/vendorModel');
const NotificationModel = require('../models/notificationModel');
const ActivityLogModel = require('../models/activityLogModel');
const PaymentModel = require('../models/paymentModel');

const STATUS_NOTIFICATION_TEXT = {
  accepted: 'Your order has been accepted by the vendor and will be prepared soon.',
  preparing: 'Your order is now being prepared.',
  ready: 'Your food is ready for pickup!',
  completed: 'Your order has been completed. Enjoy your meal!',
  cancelled: 'Your order has been cancelled.'
};

const OrderController = {
  // POST /api/orders  (checkout - customer only)
  async createOrder(req, res, next) {
    try {
      const { vendorId, items, paymentMethod, pickupNote } = req.body;

      if (!vendorId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'A vendor and at least one food item are required.' });
      }
      if (!['pickup', 'bank_transfer', 'paystack'].includes(paymentMethod)) {
        return res.status(400).json({ success: false, message: 'Invalid payment method.' });
      }
      if (paymentMethod === 'paystack' && process.env.PAYSTACK_ENABLED !== 'true') {
        return res.status(400).json({ success: false, message: 'Card payment is currently unavailable. Please choose Pay on Pickup or Bank Transfer.' });
      }

      const vendor = await VendorModel.findById(vendorId);
      if (!vendor || vendor.approval_status !== 'approved') {
        return res.status(404).json({ success: false, message: 'Vendor not available.' });
      }

      // Re-validate each item server-side: correct vendor, available, current price
      const resolvedItems = [];
      for (const item of items) {
        const food = await FoodModel.findById(item.foodId);
        if (!food || food.vendor_id !== Number(vendorId)) {
          return res.status(400).json({ success: false, message: 'One or more items do not belong to the selected vendor.' });
        }
        if (food.availability !== 'available') {
          return res.status(400).json({ success: false, message: `"${food.food_name}" is currently unavailable.` });
        }
        const quantity = parseInt(item.quantity, 10);
        if (!quantity || quantity < 1) {
          return res.status(400).json({ success: false, message: 'Invalid quantity supplied.' });
        }
        resolvedItems.push({ foodId: food.id, quantity, unitPrice: parseFloat(food.price) });
      }

      const { orderId, orderNumber, totalAmount } = await OrderModel.createOrder({
        userId: req.user.id,
        vendorId,
        items: resolvedItems,
        paymentMethod,
        pickupNote
      });

      await NotificationModel.create({
        userId: req.user.id,
        title: 'Order placed successfully',
        message: `Your order ${orderNumber} has been placed and is pending vendor confirmation.`,
        type: 'order_placed'
      });
      await NotificationModel.create({
        userId: vendor.user_id,
        title: 'New order received',
        message: `You have a new order ${orderNumber} totalling ₦${totalAmount.toLocaleString()}.`,
        type: 'new_order'
      });
      await ActivityLogModel.log({
        userId: req.user.id,
        action: 'order_created',
        details: `Order ${orderNumber} placed for vendor #${vendorId}`
      });

      res.status(201).json({ success: true, message: 'Order placed successfully.', orderId, orderNumber, totalAmount });
    } catch (err) { next(err); }
  },

  // GET /api/orders/mine (customer)
  async myOrders(req, res, next) {
    try {
      const orders = await OrderModel.listByCustomer(req.user.id);
      res.json({ success: true, orders });
    } catch (err) { next(err); }
  },

  // GET /api/orders/:id (detail - accessible by owning customer, owning vendor, or admin)
  async getOne(req, res, next) {
    try {
      const order = await OrderModel.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

      if (req.user.role === 'customer' && order.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'You cannot view this order.' });
      }
      if (req.user.role === 'vendor') {
        const vendor = await VendorModel.findByUserId(req.user.id);
        if (!vendor || vendor.id !== order.vendor_id) {
          return res.status(403).json({ success: false, message: 'You cannot view this order.' });
        }
      }

      const items = await OrderModel.getItems(order.id);
      const payment = await PaymentModel.findByOrderId(order.id);
      res.json({ success: true, order, items, payment });
    } catch (err) { next(err); }
  },

  // GET /api/orders/vendor/mine (vendor's incoming orders)
  async vendorOrders(req, res, next) {
    try {
      const vendor = await VendorModel.findByUserId(req.user.id);
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
      const { status } = req.query;
      const orders = await OrderModel.listByVendor(vendor.id, { status });
      res.json({ success: true, orders });
    } catch (err) { next(err); }
  },

  // PUT /api/orders/:id/status  (vendor moves order through workflow)
  async updateStatus(req, res, next) {
    try {
      const { status, cancellationReason } = req.body;
      const order = await OrderModel.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

      const vendor = await VendorModel.findByUserId(req.user.id);
      if (!vendor || vendor.id !== order.vendor_id) {
        return res.status(403).json({ success: false, message: 'You cannot update this order.' });
      }

      if (!OrderModel.canTransition(order.order_status, status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot move an order from "${order.order_status}" to "${status}".`
        });
      }
      if (status === 'cancelled' && !cancellationReason) {
        return res.status(400).json({ success: false, message: 'A cancellation reason is required.' });
      }

      await OrderModel.updateStatus(order.id, status, cancellationReason);

      await NotificationModel.create({
        userId: order.user_id,
        title: `Order ${order.order_number} update`,
        message: STATUS_NOTIFICATION_TEXT[status] || `Order status changed to ${status}.`,
        type: 'order_status'
      });
      await ActivityLogModel.log({
        userId: req.user.id,
        action: 'order_status_update',
        details: `Order ${order.order_number} moved to ${status}`
      });

      res.json({ success: true, message: `Order marked as ${status}.` });
    } catch (err) { next(err); }
  },

  // PUT /api/orders/:id/payment  (customer submits bank transfer proof, or vendor/admin confirms payment)
  async updatePayment(req, res, next) {
    try {
      const order = await OrderModel.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

      if (req.user.role === 'customer') {
        if (order.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized.' });
        const { reference } = req.body;
        if (!reference) return res.status(400).json({ success: false, message: 'Transaction reference is required.' });
        await OrderModel.submitBankTransferProof(order.id, { reference });
        await NotificationModel.create({
          userId: order.user_id,
          title: 'Payment proof submitted',
          message: `Your bank transfer details for order ${order.order_number} were submitted for verification.`,
          type: 'payment_update'
        });
        return res.json({ success: true, message: 'Payment reference submitted for verification.' });
      }

      // vendor or admin confirming payment status
      const { paymentStatus } = req.body;
      if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid payment status.' });
      }
      if (req.user.role === 'vendor') {
        const vendor = await VendorModel.findByUserId(req.user.id);
        if (!vendor || vendor.id !== order.vendor_id) return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
      await OrderModel.updatePaymentStatus(order.id, paymentStatus);
      await NotificationModel.create({
        userId: order.user_id,
        title: `Payment status updated`,
        message: `Payment for order ${order.order_number} is now marked as ${paymentStatus}.`,
        type: 'payment_update'
      });
      res.json({ success: true, message: 'Payment status updated.' });
    } catch (err) { next(err); }
  },

  // GET /api/orders/vendor/sales-report
  async vendorSalesReport(req, res, next) {
    try {
      const vendor = await VendorModel.findByUserId(req.user.id);
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
      const summary = await OrderModel.vendorSalesSummary(vendor.id);
      const orders = await OrderModel.listByVendor(vendor.id);
      res.json({ success: true, summary, orders });
    } catch (err) { next(err); }
  },


  // GET /api/orders/admin/all
  async adminListAll(req, res, next) {
    try {
      const { vendorId, customerSearch, orderStatus, paymentStatus, dateFrom, dateTo } = req.query;
      const orders = await OrderModel.listAll({ vendorId, customerSearch, orderStatus, paymentStatus, dateFrom, dateTo });
      res.json({ success: true, orders });
    } catch (err) { next(err); }
  }
};

module.exports = OrderController;
