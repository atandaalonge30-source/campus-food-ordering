const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const authenticate = require('../middleware/auth');
const { customerOnly, vendorOnly, adminOnly } = require('../middleware/roles');

// Customer
router.post('/', authenticate, customerOnly, OrderController.createOrder);
router.get('/mine', authenticate, customerOnly, OrderController.myOrders);

// Vendor
router.get('/vendor/mine', authenticate, vendorOnly, OrderController.vendorOrders);
router.get('/vendor/sales-report', authenticate, vendorOnly, OrderController.vendorSalesReport);

// Admin
router.get('/admin/all', authenticate, adminOnly, OrderController.adminListAll);

// Shared (must come after the more specific static routes above)
router.get('/:id', authenticate, OrderController.getOne);
router.put('/:id/status', authenticate, vendorOnly, OrderController.updateStatus);
router.put('/:id/payment', authenticate, OrderController.updatePayment);

module.exports = router;
