const mysql = require('mysql2/promise');
require('dotenv').config();

const useSSL = String(process.env.DB_SSL).toLowerCase() === 'true';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_food_ordering',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: useSSL ? { rejectUnauthorized: true } : undefined
});

// Quick startup check so connection problems surface immediately in logs
pool.getConnection()
  .then((conn) => {
    console.log('MySQL connection pool established.');
    conn.release();
  })
  .catch((err) => {
    console.error('MySQL connection failed on startup:', err.message);
  });

module.exports = pool;
