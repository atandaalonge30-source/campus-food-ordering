const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const {
  handleValidation, registerCustomerRules, registerVendorRules, loginRules, changePasswordRules
} = require('../utils/validators');

router.post('/register/customer', authLimiter, registerCustomerRules, handleValidation, AuthController.registerCustomer);
router.post('/register/vendor', authLimiter, registerVendorRules, handleValidation, AuthController.registerVendor);
router.post('/login', authLimiter, loginRules, handleValidation, AuthController.login);

router.get('/me', authenticate, AuthController.me);
router.put('/profile', authenticate, AuthController.updateProfile);
router.put('/change-password', authenticate, changePasswordRules, handleValidation, AuthController.changePassword);

module.exports = router;
