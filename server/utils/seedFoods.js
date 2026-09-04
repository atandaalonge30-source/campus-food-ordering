require('dotenv').config();
const pool = require('../config/db');
const FoodModel = require('../models/foodModel');

const force = process.argv.includes('--force');

async function run() {
  // Check if foods already exist
  const [rows] = await pool.query('SELECT COUNT(*) AS cnt FROM foods');
  if (!force && rows[0].cnt > 0) {
    console.log('Foods table already has data. Skipping seed. Use --force to update images.');
    process.exit(0);
  }

  const foods = [
    { vendorId: 1, categoryId: 1, foodName: 'Jollof Rice', description: 'Smoky party-style jollof rice with pepper sauce.', price: 1200.00, availability: 'available', image: 'https://source.unsplash.com/collection/190727/800x600?sig=1' },
    { vendorId: 1, categoryId: 1, foodName: 'Fried Rice', description: 'Nigerian fried rice with mixed vegetables.', price: 1300.00, availability: 'available', image: 'https://source.unsplash.com/collection/190727/800x600?sig=2' },
    { vendorId: 1, categoryId: 1, foodName: 'White Rice and Stew', description: 'Steamed white rice with rich tomato stew.', price: 1100.00, availability: 'available', image: 'https://source.unsplash.com/collection/190727/800x600?sig=3' },
    { vendorId: 1, categoryId: 2, foodName: 'Grilled Chicken', description: 'Well-seasoned grilled chicken laps.', price: 1500.00, availability: 'available', image: 'https://source.unsplash.com/collection/190727/800x600?sig=4' },
    { vendorId: 1, categoryId: 3, foodName: 'Soft Drink', description: 'Chilled 50cl bottled soft drink.', price: 350.00, availability: 'available', image: 'https://source.unsplash.com/collection/190727/800x600?sig=5' },
    { vendorId: 2, categoryId: 4, foodName: 'Amala', description: 'Smooth amala served with your choice of soup.', price: 1000.00, availability: 'available', image: 'https://source.unsplash.com/collection/190727/800x600?sig=6' },
    { vendorId: 2, categoryId: 4, foodName: 'Pounded Yam', description: 'Freshly pounded yam, soft and stretchy.', price: 1200.00, availability: 'available', image: 'https://source.unsplash.com/collection/190727/800x600?sig=7' },
    { vendorId: 2, categoryId: 4, foodName: 'Eba', description: 'Well-garri eba, a swallow classic.', price: 900.00, availability: 'available', image: 'https://source.unsplash.com/collection/190727/800x600?sig=8' },
    { vendorId: 2, categoryId: 5, foodName: 'Egusi Soup', description: 'Melon seed soup loaded with assorted meat.', price: 1800.00, availability: 'available', image: 'https://source.unsplash.com/collection/190727/800x600?sig=9' },
    { vendorId: 2, categoryId: 5, foodName: 'Vegetable Soup', description: 'Efo-style vegetable soup with fish and meat.', price: 1700.00, availability: 'unavailable', image: 'https://source.unsplash.com/collection/190727/800x600?sig=10' },
    { vendorId: 3, categoryId: 6, foodName: 'Meat Pie', description: 'Golden baked pastry with seasoned minced meat.', price: 500.00, availability: 'available', image: 'https://source.unsplash.com/collection/190727/800x600?sig=11' },
    { vendorId: 3, categoryId: 6, foodName: 'Sausage Roll', description: 'Classic sausage wrapped in pastry.', price: 400.00, availability: 'available', image: 'https://source.unsplash.com/collection/190727/800x600?sig=12' },
    { vendorId: 3, categoryId: 7, foodName: 'Bottled Water', description: 'Chilled 75cl bottled water.', price: 200.00, availability: 'available', image: 'https://source.unsplash.com/collection/190727/800x600?sig=13' }
  ];

  for (const f of foods) {
    try {
      // Try to find existing food by vendor and name
      const [existing] = await pool.query('SELECT id FROM foods WHERE vendor_id = ? AND food_name = ? LIMIT 1', [f.vendorId, f.foodName]);
      if (existing.length > 0) {
        const id = existing[0].id;
        // Update image and fields
        await FoodModel.updateImage(id, f.image);
        await FoodModel.update(id, { categoryId: f.categoryId, foodName: f.foodName, description: f.description, price: f.price, availability: f.availability });
        console.log('Updated food id', id, f.foodName);
      } else {
        const id = await FoodModel.create({
          vendorId: f.vendorId,
          categoryId: f.categoryId,
          foodName: f.foodName,
          description: f.description,
          price: f.price,
          image: f.image
        });
        console.log('Inserted food id', id, f.foodName);
      }
    } catch (err) {
      console.error('Failed to insert/update', f.foodName, err.message || err);
    }
  }

  console.log('Food seeding complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err.message || err);
  process.exit(1);
});
