require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Campus Food Ordering API listening on port ${PORT} (${process.env.NODE_ENV || 'development'} mode).`);
  });
}

module.exports = app;
