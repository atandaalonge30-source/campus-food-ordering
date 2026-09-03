const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const UserModel = require('../models/userModel');
const VendorModel = require('../models/vendorModel');
const ActivityLogModel = require('../models/activityLogModel');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, fullName: user.full_name },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

const AuthController = {
  // POST /api/auth/register/customer
  async registerCustomer(req, res, next) {
    try {
      const { fullName, email, phone, password } = req.body;
      const existing = await UserModel.findByEmail(email.toLowerCase().trim());
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }
      const hashed = await bcrypt.hash(password, 10);
      const userId = await UserModel.create({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone,
        hashedPassword: hashed,
        role: 'customer'
      });
      await ActivityLogModel.log({ userId, action: 'customer_registration', details: `New customer registered: ${email}` });
      const user = await UserModel.findById(userId);
      const token = signToken(user);
      res.status(201).json({ success: true, message: 'Registration successful.', token, user: sanitizeUser(user) });
    } catch (err) { next(err); }
  },

  // POST /api/auth/register/vendor
  async registerVendor(req, res, next) {
    try {
      const { ownerName, businessName, email, phone, campusLocation, description, password } = req.body;
      const existing = await UserModel.findByEmail(email.toLowerCase().trim());
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }
      const hashed = await bcrypt.hash(password, 10);
      const userId = await UserModel.create({
        fullName: ownerName.trim(),
        email: email.toLowerCase().trim(),
        phone,
        hashedPassword: hashed,
        role: 'vendor'
      });
      const vendorId = await VendorModel.create({
        userId, businessName: businessName.trim(), campusLocation, description
      });
      await ActivityLogModel.log({ userId, action: 'vendor_registration', details: `New vendor application: ${businessName}` });
      res.status(201).json({
        success: true,
        message: 'Vendor application submitted. Your account is awaiting administrator approval.',
        vendorId
      });
    } catch (err) { next(err); }
  },

  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findByEmail(email.toLowerCase().trim());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        await ActivityLogModel.log({ userId: user.id, action: 'failed_login', details: `Failed login attempt for ${email}` });
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact the administrator.' });
      }

      let vendorInfo = null;
      if (user.role === 'vendor') {
        vendorInfo = await VendorModel.findByUserId(user.id);
        if (!vendorInfo || vendorInfo.approval_status === 'pending') {
          return res.status(403).json({ success: false, message: 'Your vendor account is awaiting administrator approval.' });
        }
        if (vendorInfo.approval_status === 'rejected') {
          return res.status(403).json({ success: false, message: 'Your vendor application was rejected. Please contact the administrator.' });
        }
        if (vendorInfo.approval_status === 'suspended') {
          return res.status(403).json({ success: false, message: 'Your vendor account has been suspended. Please contact the administrator.' });
        }
      }

      const token = signToken(user);
      await ActivityLogModel.log({ userId: user.id, action: 'successful_login', details: `${user.role} logged in` });

      res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: sanitizeUser(user),
        vendor: vendorInfo ? { id: vendorInfo.id, businessName: vendorInfo.business_name } : null
      });
    } catch (err) { next(err); }
  },

  // GET /api/auth/me
  async me(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      let vendorInfo = null;
      if (user.role === 'vendor') {
        vendorInfo = await VendorModel.findByUserId(user.id);
      }
      res.json({ success: true, user: sanitizeUser(user), vendor: vendorInfo });
    } catch (err) { next(err); }
  },

  // PUT /api/auth/profile
  async updateProfile(req, res, next) {
    try {
      const { fullName, phone, email } = req.body;
      if (email) {
        const existing = await UserModel.findByEmail(email.toLowerCase().trim());
        if (existing && existing.id !== req.user.id) {
          return res.status(409).json({ success: false, message: 'That email is already in use by another account.' });
        }
      }
      const current = await UserModel.findById(req.user.id);
      await UserModel.updateProfile(req.user.id, {
        fullName: fullName || current.full_name,
        phone: phone || current.phone,
        email: (email || current.email).toLowerCase().trim()
      });
      const updated = await UserModel.findById(req.user.id);
      res.json({ success: true, message: 'Profile updated successfully.', user: sanitizeUser(updated) });
    } catch (err) { next(err); }
  },

  // PUT /api/auth/change-password
  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await UserModel.findById(req.user.id);
      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      await UserModel.updatePassword(req.user.id, hashed);
      await ActivityLogModel.log({ userId: req.user.id, action: 'password_change', details: 'User changed their password' });
      res.json({ success: true, message: 'Password changed successfully.' });
    } catch (err) { next(err); }
  }
};

module.exports = AuthController;
