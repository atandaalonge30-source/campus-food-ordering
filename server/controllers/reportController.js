const PaymentModel = require('../models/paymentModel');
const OrderModel = require('../models/orderModel');
const UserModel = require('../models/userModel');
const VendorModel = require('../models/vendorModel');
const FoodModel = require('../models/foodModel');

const ReportController = {
  // GET /api/admin/transactions
  async transactions(req, res, next) {
    try {
      const transactions = await PaymentModel.listAll();
      res.json({ success: true, transactions });
    } catch (err) { next(err); }
  },

  // GET /api/admin/reports/:type
  // type: customers | vendors | foods | orders | pending-orders | completed-orders | cancelled-orders | payments | transactions | sales
  async generate(req, res, next) {
    try {
      const { type } = req.params;
      let data, title;

      switch (type) {
        case 'customers':
          title = 'Customer Report';
          data = await UserModel.listCustomers({});
          break;
        case 'vendors':
          title = 'Vendor Report';
          data = await VendorModel.listAll({});
          break;
        case 'foods':
          title = 'Food Report';
          data = await FoodModel.listPublic({});
          break;
        case 'orders':
          title = 'Order Report';
          data = await OrderModel.listAll({});
          break;
        case 'pending-orders':
          title = 'Pending Order Report';
          data = await OrderModel.listAll({ orderStatus: 'pending' });
          break;
        case 'completed-orders':
          title = 'Completed Order Report';
          data = await OrderModel.listAll({ orderStatus: 'completed' });
          break;
        case 'cancelled-orders':
          title = 'Cancelled Order Report';
          data = await OrderModel.listAll({ orderStatus: 'cancelled' });
          break;
        case 'payments':
        case 'transactions':
          title = 'Transaction Report';
          data = await PaymentModel.listAll();
          break;
        case 'sales':
          title = 'Sales Report';
          data = await OrderModel.listAll({ orderStatus: 'completed' });
          break;
        default:
          return res.status(400).json({ success: false, message: 'Unknown report type.' });
      }

      res.json({ success: true, title, generatedAt: new Date().toISOString(), rows: data });
    } catch (err) { next(err); }
  }
};

module.exports = ReportController;
