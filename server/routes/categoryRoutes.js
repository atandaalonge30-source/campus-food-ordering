const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const authenticate = require('../middleware/auth');
const { vendorOnly } = require('../middleware/roles');

router.get('/mine', authenticate, vendorOnly, CategoryController.listMine);
router.get('/vendor/:vendorId', CategoryController.listByVendorPublic); // public - for menu filters
router.post('/', authenticate, vendorOnly, CategoryController.create);
router.put('/:id', authenticate, vendorOnly, CategoryController.update);
router.delete('/:id', authenticate, vendorOnly, CategoryController.remove);

module.exports = router;
