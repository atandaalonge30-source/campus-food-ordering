-- =========================================================
-- Campus Food Ordering System - Sample Data
-- All sample accounts use the password:  Password123!
-- (bcrypt-hashed below — never store plain text in real use)
-- =========================================================

USE campus_food_ordering;

-- Users: 1 admin, 3 vendor-owners, 2 customers
INSERT INTO users (full_name, email, phone, password, role, status) VALUES
('System Administrator', 'admin@tpi.edu.ng', '08010000001', '$2b$10$2uJu0KQr8X0JdI2eZIaZ6eYlewSUon9MA5.rd1T2HxKt.ondKvYDW', 'admin', 'active'),
('Adeola Bakare',        'campusbites@tpi.edu.ng', '08010000002', '$2b$10$2uJu0KQr8X0JdI2eZIaZ6eYlewSUon9MA5.rd1T2HxKt.ondKvYDW', 'vendor', 'active'),
('Emeka Chukwu',         'polykitchen@tpi.edu.ng', '08010000003', '$2b$10$2uJu0KQr8X0JdI2eZIaZ6eYlewSUon9MA5.rd1T2HxKt.ondKvYDW', 'vendor', 'active'),
('Funmi Okonkwo',        'studentcafe@tpi.edu.ng', '08010000004', '$2b$10$2uJu0KQr8X0JdI2eZIaZ6eYlewSUon9MA5.rd1T2HxKt.ondKvYDW', 'vendor', 'active'),
('Tobi Adebayo',         'tobi.student@tpi.edu.ng', '08020000001', '$2b$10$2uJu0KQr8X0JdI2eZIaZ6eYlewSUon9MA5.rd1T2HxKt.ondKvYDW', 'customer', 'active'),
('Chidinma Eze',         'chidinma.student@tpi.edu.ng', '08020000002', '$2b$10$2uJu0KQr8X0JdI2eZIaZ6eYlewSUon9MA5.rd1T2HxKt.ondKvYDW', 'customer', 'active');

-- Vendors (linked to the vendor users above, all approved)
INSERT INTO vendors (user_id, business_name, campus_location, description, approval_status) VALUES
(2, 'Campus Bites',   'Student Union Building, TPI',        'Fast, tasty Nigerian meals for busy students.', 'approved'),
(3, 'Poly Kitchen',   'Behind School of Engineering, TPI',  'Home-style soups and swallow made fresh daily.', 'approved'),
(4, 'Student Cafe',   'Main Gate Area, TPI',                'Snacks, drinks and quick bites between lectures.', 'approved');

-- Categories
INSERT INTO categories (vendor_id, category_name, description) VALUES
(1, 'Rice Dishes', 'Jollof, fried rice and rice combos'),
(1, 'Proteins',    'Chicken, beef, fish and other proteins'),
(1, 'Beverages',   'Soft drinks and bottled water'),
(2, 'Swallows',    'Amala, eba, pounded yam'),
(2, 'Soups',       'Egusi, vegetable and other soups'),
(3, 'Snacks',      'Meat pie, sausage roll and pastries'),
(3, 'Beverages',   'Drinks and water');

-- Foods
INSERT INTO foods (vendor_id, category_id, food_name, description, price, availability) VALUES
(1, 1, 'Jollof Rice',            'Smoky party-style jollof rice with pepper sauce.', 1200.00, 'available'),
(1, 1, 'Fried Rice',             'Nigerian fried rice with mixed vegetables.',        1300.00, 'available'),
(1, 1, 'White Rice and Stew',    'Steamed white rice with rich tomato stew.',         1100.00, 'available'),
(1, 2, 'Grilled Chicken',        'Well-seasoned grilled chicken laps.',                1500.00, 'available'),
(1, 3, 'Soft Drink',             'Chilled 50cl bottled soft drink.',                    350.00, 'available'),
(2, 4, 'Amala',                  'Smooth amala served with your choice of soup.',      1000.00, 'available'),
(2, 4, 'Pounded Yam',            'Freshly pounded yam, soft and stretchy.',            1200.00, 'available'),
(2, 4, 'Eba',                    'Well-garri eba, a swallow classic.',                  900.00, 'available'),
(2, 5, 'Egusi Soup',             'Melon seed soup loaded with assorted meat.',         1800.00, 'available'),
(2, 5, 'Vegetable Soup',         'Efo-style vegetable soup with fish and meat.',       1700.00, 'unavailable'),
(3, 6, 'Meat Pie',               'Golden baked pastry with seasoned minced meat.',      500.00, 'available'),
(3, 6, 'Sausage Roll',           'Classic sausage wrapped in pastry.',                  400.00, 'available'),
(3, 7, 'Bottled Water',          'Chilled 75cl bottled water.',                         200.00, 'available');
