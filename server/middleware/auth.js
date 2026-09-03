const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

function authenticate(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token missing.' });
  }

  try {
    const payload = jwt.verify(token, jwtConfig.secret);
    req.user = payload; // { id, role, email, fullName }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
}

module.exports = authenticate;
