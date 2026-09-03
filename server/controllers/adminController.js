const UserModel = require('../models/userModel');
const VendorModel = require('../models/vendorModel');
const FoodModel = require('../models/foodModel');
const OrderModel = require('../models/orderModel');
const ActivityLogModel = require('../models/activityLogModel');

const AdminController = {
  // GET /api/admin/dashboard
  async dashboard(req, res, next) {
    try {
      const userCounts = await UserModel.counts();
      const vendorCounts = await VendorModel.counts();
      const foodCounts = await FoodModel.adminCounts();
      const orderCounts = await OrderModel.adminDashboardCounts();
      const recentOrders = await OrderModel.recentActivityOrders(8);
      const recentActivity = await ActivityLogModel.list({ limit: 8 });

      res.json({
        success: true,
        stats: {
          totalCustomers: userCounts.totalCustomers || 0,
          totalVendors: vendorCounts.totalVendors || 0,
          pendingVendors: vendorCounts.pendingVendors || 0,
          approvedVendors: vendorCounts.approvedVendors || 0,
          suspendedVendors: vendorCounts.suspendedVendors || 0,
          totalFoodItems: foodCounts.totalFoods || 0,
          totalOrders: orderCounts.totalOrders || 0,
          pendingOrders: orderCounts.pendingOrders || 0,
          completedOrders: orderCounts.completedOrders || 0,
          cancelledOrders: orderCounts.cancelledOrders || 0,
          totalTransactions: orderCounts.totalTransactions || 0,
          totalSales: orderCounts.totalSales || 0
        },
        recentOrders,
        recentActivity
      });
    } catch (err) { next(err); }
  },

  // GET /api/admin/customers?search=
  async listCustomers(req, res, next) {
    try {
      const customers = await UserModel.listCustomers({ search: req.query.search });
      res.json({ success: true, customers });
    } catch (err) { next(err); }
  },

  // GET /api/admin/customers/:id
  async getCustomer(req, res, next) {
    try {
      const customer = await UserModel.findById(req.params.id);
      if (!customer || customer.role !== 'customer') {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }
      const { password, ...safe } = customer;
      const orders = await require('../models/orderModel').listByCustomer(customer.id);
      res.json({ success: true, customer: safe, orders });
    } catch (err) { next(err); }
  },

  // PUT /api/admin/customers/:id/status
  async setCustomerStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!['active', 'suspended'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
      }
      const customer = await UserModel.findById(req.params.id);
      if (!customer || customer.role !== 'customer') {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }
      await UserModel.setStatus(customer.id, status);
      await ActivityLogModel.log({
        userId: req.user.id,
        action: `account_${status}`,
        details: `Admin set customer #${customer.id} (${customer.email}) to ${status}`
      });
      res.json({ success: true, message: `Customer account ${status}.` });
    } catch (err) { next(err); }
  }
};

module.exports = AdminController;
