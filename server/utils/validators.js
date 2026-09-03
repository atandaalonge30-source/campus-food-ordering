const { body, validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
}

const registerCustomerRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.'),
  body('email').isEmail().withMessage('A valid email address is required.'),
  body('phone').trim().notEmpty().withMessage('Phone number is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.')
];

const registerVendorRules = [
  body('ownerName').trim().notEmpty().withMessage('Owner name is required.'),
  body('businessName').trim().notEmpty().withMessage('Business name is required.'),
  body('email').isEmail().withMessage('A valid email address is required.'),
  body('phone').trim().notEmpty().withMessage('Phone number is required.'),
  body('campusLocation').trim().notEmpty().withMessage('Campus location is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.')
];

const loginRules = [
  body('email').isEmail().withMessage('A valid email address is required.'),
  body('password').notEmpty().withMessage('Password is required.')
];

const changePasswordRules = [
  body('oldPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.')
];

module.exports = {
  handleValidation,
  registerCustomerRules,
  registerVendorRules,
  loginRules,
  changePasswordRules
};
