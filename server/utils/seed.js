/**
 * Creates the initial administrator account if one does not already exist.
 * Run with:  npm run seed
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from environment variables
 * if provided, otherwise falls back to sensible demo defaults.
 * CHANGE THE DEFAULT PASSWORD IMMEDIATELY IN A REAL DEPLOYMENT.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function run() {
  const email = (process.env.ADMIN_EMAIL || 'admin@tpi.edu.ng').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Password123!';
  const fullName = process.env.ADMIN_NAME || 'System Administrator';

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (existing.length > 0) {
    console.log(`Admin account already exists for ${email}. Nothing to do.`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (full_name, email, phone, password, role, status) VALUES (?, ?, ?, ?, 'admin', 'active')`,
    [fullName, email, '08000000000', hashed]
  );

  console.log('Administrator account created:');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log('Please log in and change this password immediately.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
