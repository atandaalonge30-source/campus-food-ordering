const VendorModel = require('../models/vendorModel');
const FoodModel = require('../models/foodModel');
const OrderModel = require('../models/orderModel');
const NotificationModel = require('../models/notificationModel');
const ActivityLogModel = require('../models/activityLogModel');

const VendorController = {
  // GET /api/vendors  (public - approved vendors only)
  async listPublic(req, res, next) {
    try {
      const vendors = await VendorModel.listApproved();
      res.json({ success: true, vendors });
    } catch (err) { next(err); }
  },

  // GET /api/vendors/:id (public vendor profile + menu)
  async getPublicProfile(req, res, next) {
    try {
      const vendor = await VendorModel.findById(req.params.id);
      if (!vendor || vendor.approval_status !== 'approved') {
        return res.status(404).json({ success: false, message: 'Vendor not found.' });
      }
      const foods = await FoodModel.listByVendor(vendor.id);
      res.json({
        success: true,
        vendor,
        foods: foods.filter(f => true) // public: show all, mark unavailable in UI
      });
    } catch (err) { next(err); }
  },

  // GET /api/vendors/me (vendor's own profile)
  async getMyProfile(req, res, next) {
    try {
      const vendor = await VendorModel.findByUserId(req.user.id);
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
      res.json({ success: true, vendor });
    } catch (err) { next(err); }
  },

  // PUT /api/vendors/me
  async updateMyProfile(req, res, next) {
    try {
      const vendor = await VendorModel.findByUserId(req.user.id);
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
      const { businessName, campusLocation, description } = req.body;
      await VendorModel.updateProfile(vendor.id, {
        businessName: businessName || vendor.business_name,
        campusLocation: campusLocation || vendor.campus_location,
        description: description ?? vendor.description
      });
      res.json({ success: true, message: 'Vendor profile updated.' });
    } catch (err) { next(err); }
  },

  // POST /api/vendors/me/logo
  async uploadLogo(req, res, next) {
    try {
      const vendor = await VendorModel.findByUserId(req.user.id);
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
      if (!req.file) return res.status(400).json({ success: false, message: 'No image file uploaded.' });
      await VendorModel.updateLogo(vendor.id, req.file.filename);
      res.json({ success: true, message: 'Logo updated.', logo: req.file.filename });
    } catch (err) { next(err); }
  },

  // GET /api/vendors/me/dashboard
  async myDashboard(req, res, next) {
    try {
      const vendor = await VendorModel.findByUserId(req.user.id);
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
      const foodCounts = await FoodModel.counts(vendor.id);
      const sales = await OrderModel.vendorSalesSummary(vendor.id);
      const recentOrders = await OrderModel.listByVendor(vendor.id);
      res.json({
        success: true,
        vendor,
        stats: {
          totalFoodItems: foodCounts.totalFoods || 0,
          availableFoodItems: foodCounts.availableFoods || 0,
          ...sales
        },
        recentOrders: recentOrders.slice(0, 8)
      });
    } catch (err) { next(err); }
  },

  // ---------- ADMIN ACTIONS ----------

  // GET /api/vendors/admin/all?status=&search=
  async adminListAll(req, res, next) {
    try {
      const { status, search } = req.query;
      const vendors = await VendorModel.listAll({ status, search });
      res.json({ success: true, vendors });
    } catch (err) { next(err); }
  },

  // GET /api/vendors/admin/:id (full detail incl. foods & orders, for admin)
  async adminGetOne(req, res, next) {
    try {
      const vendor = await VendorModel.findById(req.params.id);
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found.' });
      const foods = await FoodModel.listByVendor(vendor.id);
      const orders = await OrderModel.listByVendor(vendor.id);
      res.json({ success: true, vendor, foods, orders });
    } catch (err) { next(err); }
  },

  // PUT /api/vendors/admin/:id/status  { status: approved|rejected|suspended|pending }
  async adminSetStatus(req, res, next) {
    try {
      const { status } = req.body;
      const valid = ['pending', 'approved', 'rejected', 'suspended'];
      if (!valid.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
      }
      const vendor = await VendorModel.findById(req.params.id);
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found.' });

      await VendorModel.setApprovalStatus(vendor.id, status);
      await ActivityLogModel.log({
        userId: req.user.id,
        action: `vendor_${status}`,
        details: `Admin set vendor "${vendor.business_name}" (#${vendor.id}) to ${status}`
      });

      const messages = {
        approved: 'Congratulations! Your vendor account has been approved. You can now log in and start selling.',
        rejected: 'Your vendor application has been rejected. Please contact the administrator for details.',
        suspended: 'Your vendor account has been suspended by the administrator.',
        pending: 'Your vendor account status has been reset to pending review.'
      };
      await NotificationModel.create({
        userId: vendor.user_id,
        title: 'Vendor account status updated',
        message: messages[status],
        type: 'vendor_status'
      });

      res.json({ success: true, message: `Vendor status updated to ${status}.` });
    } catch (err) { next(err); }
  }
};

module.exports = VendorController;
