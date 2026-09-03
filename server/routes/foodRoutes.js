const express = require('express');
const router = express.Router();
const FoodController = require('../controllers/foodController');
const authenticate = require('../middleware/auth');
const { vendorOnly } = require('../middleware/roles');
const upload = require('../utils/upload');

// Vendor self-service (static path before /:id wildcard)
router.get('/mine', authenticate, vendorOnly, FoodController.listMine);
router.post('/', authenticate, vendorOnly, upload.single('image'), FoodController.create);
router.put('/:id/availability', authenticate, vendorOnly, FoodController.setAvailability);
router.put('/:id', authenticate, vendorOnly, upload.single('image'), FoodController.update);
router.delete('/:id', authenticate, vendorOnly, FoodController.remove);

// Public
router.get('/', FoodController.listPublic);
router.get('/:id', FoodController.getOnePublic);

module.exports = router;
