function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}

const customerOnly = requireRole('customer');
const vendorOnly = requireRole('vendor');
const adminOnly = requireRole('admin');

module.exports = { requireRole, customerOnly, vendorOnly, adminOnly };
