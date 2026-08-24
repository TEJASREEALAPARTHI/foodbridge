-- ================================================================
-- FoodBridge Sample Seed Data
-- Seed records for Users, Donations, and Pickups across India
-- ================================================================

USE foodbridge_db;

-- 1. Insert Sample Users (Donors and NGOs)
INSERT INTO users (id, name, email, role, state) VALUES
-- Donors
(1, 'Annapurna Grand Restaurant', 'contact@annapurnagrand.in', 'DONOR', 'Andhra Pradesh'),
(2, 'Paradise Royal Biryani', 'manager@paradisebiryani.in', 'DONOR', 'Telangana'),
(3, 'Udupi Heritage Kitchen', 'contact@udupiheritage.com', 'DONOR', 'Karnataka'),
(4, 'Saravana Bhavan Caterers', 'chennai@saravanabhavan.com', 'DONOR', 'Tamil Nadu'),
(5, 'Mumbai Feast Banquets', 'events@mumbaifeast.org', 'DONOR', 'Maharashtra'),
(6, 'Delhi Flavours Sweet House', 'contact@delhiflavours.in', 'DONOR', 'Delhi'),

-- NGOs
(7, 'Seva Food Rescue Foundation', 'help@sevafoundation.org', 'NGO', 'Andhra Pradesh'),
(8, 'Hope For All Community Trust', 'volunteer@hopeforall.org', 'NGO', 'Telangana'),
(9, 'Bangalore Annadana Seva Trust', 'support@bangaloreannadana.org', 'NGO', 'Karnataka'),
(10, 'Akshaya Care NGO', 'info@akshayacare.org', 'NGO', 'Tamil Nadu'),
(11, 'Robin Hood Army Mumbai', 'team@robinhoodmumbai.org', 'NGO', 'Maharashtra'),
(12, 'Delhi Hunger Relief Action', 'info@delhihungerrelief.org', 'NGO', 'Delhi');

-- 2. Insert Sample Donations
-- We use DATE_ADD(NOW(), INTERVAL X HOUR) so data is always fresh & realistic!
INSERT INTO donations (id, donor_id, food_name, food_type, category, quantity, unit, prepared_time, expiry_time, state, pickup_location, description, status) VALUES
-- Andhra Pradesh
(1, 1, 'Vegetable Pulao & Mixed Dal', 'Veg', 'Cooked Food', 25.0, 'Kg', 
 DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 6 HOUR), 
 'Andhra Pradesh', 'Opp. Bus Station, MG Road, Vijayawada', 'Freshly packed in sanitized food grade containers.', 'AVAILABLE'),

(2, 1, 'Fresh Bakery Buns & Bread', 'Veg', 'Bakery', 40.0, 'Packets', 
 DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_ADD(NOW(), INTERVAL 24 HOUR), 
 'Andhra Pradesh', 'Shop #12, Arundelpet, Guntur', 'Unsold fresh batch from morning bake.', 'AVAILABLE'),

-- Telangana
(3, 2, 'Hyderabadi Dum Biryani', 'Non-Veg', 'Cooked Food', 30.0, 'Packets', 
 DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 5 HOUR), 
 'Telangana', 'Near Clock Tower, Secunderabad, Hyderabad', 'Sealed dinner buffet surplus packets.', 'AVAILABLE'),

(4, 2, 'Paneer Butter Masala & Roti', 'Veg', 'Cooked Food', 18.0, 'Boxes', 
 DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 4 HOUR), 
 'Telangana', 'Road No. 36, Jubilee Hills, Hyderabad', 'Hot container packing with disposable cutlery.', 'ACCEPTED'),

-- Karnataka
(5, 3, 'South Indian Meals (Rice, Sambar, Poriyal)', 'Veg', 'Cooked Food', 35.0, 'Boxes', 
 DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 7 HOUR), 
 'Karnataka', '8th Cross, Malleshwaram, Bengaluru', 'Pure vegetarian canteen surplus meals.', 'AVAILABLE'),

(6, 3, 'Fresh Bananas & Apples', 'Vegan', 'Fruits & Vegetables', 20.0, 'Kg', 
 DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_ADD(NOW(), INTERVAL 48 HOUR), 
 'Karnataka', 'Near Metro Station, Indiranagar, Bengaluru', 'High nutrition fresh fruit crates.', 'PICKED UP'),

-- Tamil Nadu
(7, 4, 'Curd Rice & Pickle Packets', 'Veg', 'Cooked Food', 50.0, 'Packets', 
 DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), 
 'Tamil Nadu', 'North Usman Road, T. Nagar, Chennai', 'Cool & hygienic packaging.', 'AVAILABLE'),

(8, 4, 'Assorted Indian Sweets & Snacks', 'Veg', 'Bakery', 15.0, 'Boxes', 
 DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_ADD(NOW(), INTERVAL 36 HOUR), 
 'Tamil Nadu', 'Gandhi Road, Vellore', 'Diwali event surplus gift boxes.', 'DELIVERED'),

-- Maharashtra
(9, 5, 'Pav Bhaji & Pulao Combo', 'Veg', 'Cooked Food', 45.0, 'Boxes', 
 DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 4 HOUR), 
 'Maharashtra', 'Link Road, Andheri West, Mumbai', 'Banquet hall surplus.', 'AVAILABLE'),

-- Delhi
(10, 6, 'Rajma Chawal Lunch Boxes', 'Veg', 'Cooked Food', 30.0, 'Boxes', 
 DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 6 HOUR), 
 'Delhi', 'Block B, Connaught Place, New Delhi', 'Corporate event surplus boxed meals.', 'AVAILABLE');

-- 3. Insert Sample Pickups
INSERT INTO pickups (id, donation_id, ngo_id, status, pickup_time, delivery_time) VALUES
(1, 4, 8, 'ACCEPTED', NULL, NULL),
(2, 6, 9, 'PICKED UP', DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL),
(3, 8, 10, 'DELIVERED', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR));
