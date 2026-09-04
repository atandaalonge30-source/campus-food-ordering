-- Update existing foods to set image URLs (run on production DB if needed)
UPDATE foods SET image = CASE
  WHEN food_name = 'Jollof Rice' THEN 'https://source.unsplash.com/collection/190727/800x600?sig=1'
  WHEN food_name = 'Fried Rice' THEN 'https://source.unsplash.com/collection/190727/800x600?sig=2'
  WHEN food_name = 'White Rice and Stew' THEN 'https://source.unsplash.com/collection/190727/800x600?sig=3'
  WHEN food_name = 'Grilled Chicken' THEN 'https://source.unsplash.com/collection/190727/800x600?sig=4'
  WHEN food_name = 'Soft Drink' THEN 'https://source.unsplash.com/collection/190727/800x600?sig=5'
  WHEN food_name = 'Amala' THEN 'https://source.unsplash.com/collection/190727/800x600?sig=6'
  WHEN food_name = 'Pounded Yam' THEN 'https://source.unsplash.com/collection/190727/800x600?sig=7'
  WHEN food_name = 'Eba' THEN 'https://source.unsplash.com/collection/190727/800x600?sig=8'
  WHEN food_name = 'Egusi Soup' THEN 'https://source.unsplash.com/collection/190727/800x600?sig=9'
  WHEN food_name = 'Vegetable Soup' THEN 'https://source.unsplash.com/collection/190727/800x600?sig=10'
  WHEN food_name = 'Meat Pie' THEN 'https://source.unsplash.com/collection/190727/800x600?sig=11'
  WHEN food_name = 'Sausage Roll' THEN 'https://source.unsplash.com/collection/190727/800x600?sig=12'
  WHEN food_name = 'Bottled Water' THEN 'https://source.unsplash.com/collection/190727/800x600?sig=13'
  ELSE image
END
WHERE food_name IN (
  'Jollof Rice','Fried Rice','White Rice and Stew','Grilled Chicken','Soft Drink',
  'Amala','Pounded Yam','Eba','Egusi Soup','Vegetable Soup','Meat Pie','Sausage Roll','Bottled Water'
);
