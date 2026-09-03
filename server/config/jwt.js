require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'dev-secret-change-me',
  expiresIn: '7d'
};
