const FoodModel = require('../models/foodModel');
const VendorModel = require('../models/vendorModel');

async function getOwnedVendor(req) {
  return VendorModel.findByUserId(req.user.id);
}

const FoodController = {
  // GET /api/foods (public browsing with search/filter)
  async listPublic(req, res, next) {
    try {
      const { search, vendorId, categoryId, onlyAvailable } = req.query;
      const foods = await FoodModel.listPublic({
        search,
        vendorId: vendorId || undefined,
        categoryId: categoryId || undefined,
        onlyAvailable: onlyAvailable === 'true'
      });
      res.json({ success: true, foods });
    } catch (err) { next(err); }
  },

  // GET /api/foods/:id (public)
  async getOnePublic(req, res, next) {
    try {
      const food = await FoodModel.findById(req.params.id);
      if (!food) return res.status(404).json({ success: false, message: 'Food item not found.' });
      res.json({ success: true, food });
    } catch (err) { next(err); }
  },

  // GET /api/foods/mine (vendor's own foods)
  async listMine(req, res, next) {
    try {
      const vendor = await getOwnedVendor(req);
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
      const foods = await FoodModel.listByVendor(vendor.id);
      res.json({ success: true, foods });
    } catch (err) { next(err); }
  },

  // POST /api/foods
  async create(req, res, next) {
    try {
      const vendor = await getOwnedVendor(req);
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
      const { foodName, description, price, categoryId } = req.body;
      if (!foodName || !foodName.trim()) {
        return res.status(400).json({ success: false, message: 'Food name is required.' });
      }
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ success: false, message: 'A valid price greater than zero is required.' });
      }
      const image = req.file ? req.file.filename : null;
      const id = await FoodModel.create({
        vendorId: vendor.id,
        categoryId: categoryId || null,
        foodName: foodName.trim(),
        description,
        price: numericPrice,
        image
      });
      res.status(201).json({ success: true, message: 'Food item added.', id });
    } catch (err) { next(err); }
  },

  // PUT /api/foods/:id
  async update(req, res, next) {
    try {
      const vendor = await getOwnedVendor(req);
      const food = await FoodModel.findById(req.params.id);
      if (!food || food.vendor_id !== vendor.id) {
        return res.status(404).json({ success: false, message: 'Food item not found.' });
      }
      const { foodName, description, price, categoryId, availability } = req.body;
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ success: false, message: 'A valid price greater than zero is required.' });
      }
      await FoodModel.update(food.id, {
        categoryId: categoryId || null,
        foodName: (foodName || food.food_name).trim(),
        description: description ?? food.description,
        price: numericPrice,
        availability: availability || food.availability
      });
      if (req.file) {
        await FoodModel.updateImage(food.id, req.file.filename);
      }
      res.json({ success: true, message: 'Food item updated.' });
    } catch (err) { next(err); }
  },

  // PUT /api/foods/:id/availability
  async setAvailability(req, res, next) {
    try {
      const vendor = await getOwnedVendor(req);
      const food = await FoodModel.findById(req.params.id);
      if (!food || food.vendor_id !== vendor.id) {
        return res.status(404).json({ success: false, message: 'Food item not found.' });
      }
      const { availability } = req.body;
      if (!['available', 'unavailable'].includes(availability)) {
        return res.status(400).json({ success: false, message: 'Invalid availability value.' });
      }
      await FoodModel.setAvailability(food.id, availability);
      res.json({ success: true, message: `Food marked as ${availability}.` });
    } catch (err) { next(err); }
  },

  // DELETE /api/foods/:id
  async remove(req, res, next) {
    try {
      const vendor = await getOwnedVendor(req);
      const food = await FoodModel.findById(req.params.id);
      if (!food || food.vendor_id !== vendor.id) {
        return res.status(404).json({ success: false, message: 'Food item not found.' });
      }
      const referenced = await FoodModel.isReferencedInOrders(food.id);
      if (referenced) {
        return res.status(400).json({
          success: false,
          message: 'This food item has existing orders and cannot be deleted. Disable it instead.'
        });
      }
      await FoodModel.remove(food.id);
      res.json({ success: true, message: 'Food item deleted.' });
    } catch (err) { next(err); }
  }
};

module.exports = FoodController;
