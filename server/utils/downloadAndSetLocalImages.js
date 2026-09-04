const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const pool = require('../config/db');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const items = [
  { name: 'Jollof Rice', url: 'https://source.unsplash.com/collection/190727/800x600?sig=1', file: 'jollof.jpg' },
  { name: 'Fried Rice', url: 'https://source.unsplash.com/collection/190727/800x600?sig=2', file: 'fried_rice.jpg' },
  { name: 'White Rice and Stew', url: 'https://source.unsplash.com/collection/190727/800x600?sig=3', file: 'white_rice.jpg' },
  { name: 'Grilled Chicken', url: 'https://source.unsplash.com/collection/190727/800x600?sig=4', file: 'grilled_chicken.jpg' },
  { name: 'Soft Drink', url: 'https://source.unsplash.com/collection/190727/800x600?sig=5', file: 'soft_drink.jpg' },
  { name: 'Amala', url: 'https://source.unsplash.com/collection/190727/800x600?sig=6', file: 'amala.jpg' },
  { name: 'Pounded Yam', url: 'https://source.unsplash.com/collection/190727/800x600?sig=7', file: 'pounded_yam.jpg' },
  { name: 'Eba', url: 'https://source.unsplash.com/collection/190727/800x600?sig=8', file: 'eba.jpg' },
  { name: 'Egusi Soup', url: 'https://source.unsplash.com/collection/190727/800x600?sig=9', file: 'egusi.jpg' },
  { name: 'Vegetable Soup', url: 'https://source.unsplash.com/collection/190727/800x600?sig=10', file: 'vegetable_soup.jpg' },
  { name: 'Meat Pie', url: 'https://source.unsplash.com/collection/190727/800x600?sig=11', file: 'meat_pie.jpg' },
  { name: 'Sausage Roll', url: 'https://source.unsplash.com/collection/190727/800x600?sig=12', file: 'sausage_roll.jpg' },
  { name: 'Bottled Water', url: 'https://source.unsplash.com/collection/190727/800x600?sig=13', file: 'bottled_water.jpg' }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 400) return reject(new Error('Failed to download: ' + res.statusCode));
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const it of items) {
    const dest = path.join(UPLOAD_DIR, it.file);
    try {
      console.log('Downloading', it.url, '→', dest);
      await download(it.url, dest);
      // Update DB image field to the local filename
      await pool.query('UPDATE foods SET image = ? WHERE food_name = ?', [it.file, it.name]);
      console.log('Saved and updated DB for', it.name);
    } catch (err) {
      console.error('Failed for', it.name, err.message || err);
    }
  }
  console.log('Done. Images saved to', UPLOAD_DIR);
  process.exit(0);
}

run().catch((err) => {
  console.error('Script failed:', err.message || err);
  process.exit(1);
});
