const CategoryModel = require('../models/categoryModel');
const VendorModel = require('../models/vendorModel');

async function getOwnedVendor(req) {
  return VendorModel.findByUserId(req.user.id);
}

const CategoryController = {
  // GET /api/categories/mine
  async listMine(req, res, next) {
    try {
      const vendor = await getOwnedVendor(req);
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
      const categories = await CategoryModel.listByVendor(vendor.id);
      res.json({ success: true, categories });
    } catch (err) { next(err); }
  },

  // GET /api/categories/vendor/:vendorId (public - for menu filters)
  async listByVendorPublic(req, res, next) {
    try {
      const categories = await CategoryModel.listByVendor(req.params.vendorId);
      res.json({ success: true, categories });
    } catch (err) { next(err); }
  },

  // POST /api/categories
  async create(req, res, next) {
    try {
      const vendor = await getOwnedVendor(req);
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
      const { categoryName, description } = req.body;
      if (!categoryName || !categoryName.trim()) {
        return res.status(400).json({ success: false, message: 'Category name is required.' });
      }
      const id = await CategoryModel.create({ vendorId: vendor.id, categoryName: categoryName.trim(), description });
      res.status(201).json({ success: true, message: 'Category created.', id });
    } catch (err) { next(err); }
  },

  // PUT /api/categories/:id
  async update(req, res, next) {
    try {
      const vendor = await getOwnedVendor(req);
      const category = await CategoryModel.findById(req.params.id);
      if (!category || category.vendor_id !== vendor.id) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
      const { categoryName, description } = req.body;
      if (!categoryName || !categoryName.trim()) {
        return res.status(400).json({ success: false, message: 'Category name is required.' });
      }
      await CategoryModel.update(category.id, { categoryName: categoryName.trim(), description });
      res.json({ success: true, message: 'Category updated.' });
    } catch (err) { next(err); }
  },

  // DELETE /api/categories/:id
  async remove(req, res, next) {
    try {
      const vendor = await getOwnedVendor(req);
      const category = await CategoryModel.findById(req.params.id);
      if (!category || category.vendor_id !== vendor.id) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
      const foodCount = await CategoryModel.foodCount(category.id);
      if (foodCount > 0) {
        return res.status(400).json({
          success: false,
          message: `This category still has ${foodCount} food item(s) assigned. Reassign or delete them first.`
        });
      }
      await CategoryModel.remove(category.id);
      res.json({ success: true, message: 'Category deleted.' });
    } catch (err) { next(err); }
  }
};

module.exports = CategoryController;
