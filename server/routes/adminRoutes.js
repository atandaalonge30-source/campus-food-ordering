const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const ReportController = require('../controllers/reportController');
const ActivityLogController = require('../controllers/activityLogController');
const authenticate = require('../middleware/auth');
const { adminOnly } = require('../middleware/roles');

router.use(authenticate, adminOnly);

router.get('/dashboard', AdminController.dashboard);

router.get('/customers', AdminController.listCustomers);
router.get('/customers/:id', AdminController.getCustomer);
router.put('/customers/:id/status', AdminController.setCustomerStatus);

router.get('/transactions', ReportController.transactions);
router.get('/reports/:type', ReportController.generate);

router.get('/activity-logs', ActivityLogController.list);

module.exports = router;
