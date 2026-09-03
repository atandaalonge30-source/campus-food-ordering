const express = require('express');
const router = express.Router();
const VendorController = require('../controllers/vendorController');
const authenticate = require('../middleware/auth');
const { vendorOnly, adminOnly } = require('../middleware/roles');
const upload = require('../utils/upload');

// Vendor self-service (static paths must come before the /:id wildcard below)
router.get('/me/profile', authenticate, vendorOnly, VendorController.getMyProfile);
router.put('/me/profile', authenticate, vendorOnly, VendorController.updateMyProfile);
router.post('/me/logo', authenticate, vendorOnly, upload.single('logo'), VendorController.uploadLogo);
router.get('/me/dashboard', authenticate, vendorOnly, VendorController.myDashboard);

// Admin
router.get('/admin/all', authenticate, adminOnly, VendorController.adminListAll);
router.get('/admin/:id', authenticate, adminOnly, VendorController.adminGetOne);
router.put('/admin/:id/status', authenticate, adminOnly, VendorController.adminSetStatus);

// Public
router.get('/', VendorController.listPublic);
router.get('/:id', VendorController.getPublicProfile);

module.exports = router;
