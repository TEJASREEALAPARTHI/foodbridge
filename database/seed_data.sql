-- ==========================================================
-- FOODBRIDGE SEED DATA (Realistic Demo Dataset)
-- Locations, Users, Donors, NGOs, Food Categories, Donations
-- ==========================================================

-- 1. Insert Locations
INSERT INTO locations (location_id, country, state, city, locality, pincode) VALUES
(1, 'India', 'Andhra Pradesh', 'Vijayawada', 'Gandhinagar', '520003'),
(2, 'India', 'Andhra Pradesh', 'Vijayawada', 'Benz Circle', '520010'),
(3, 'India', 'Andhra Pradesh', 'Guntur', 'Arundelpet', '522002'),
(4, 'India', 'Andhra Pradesh', 'Visakhapatnam', 'Dwaraka Nagar', '530016'),
(5, 'India', 'Telangana', 'Hyderabad', 'Madhapur', '500081'),
(6, 'India', 'Telangana', 'Hyderabad', 'Gachibowli', '500032'),
(7, 'India', 'Karnataka', 'Bengaluru', 'Indiranagar', '560038'),
(8, 'India', 'Tamil Nadu', 'Chennai', 'T. Nagar', '600017'),
(9, 'India', 'Maharashtra', 'Mumbai', 'Andheri West', '400058');

-- 2. Insert Users
INSERT INTO users (user_id, name, email, phone, role) VALUES
(1, 'Sri Krishna Grand Admin', 'donor.krishna@foodbridge.org', '+91 98480 12345', 'DONOR'),
(2, 'VNR Hostel Canteen', 'donor.vnr@foodbridge.org', '+91 98480 67890', 'DONOR'),
(3, 'Royal Caterers Vijayawada', 'donor.royal@foodbridge.org', '+91 98480 54321', 'DONOR'),
(4, 'Seva Food Relief NGO', 'ngo.seva@foodbridge.org', '+91 94400 11223', 'NGO'),
(5, 'Annamrita Foundation', 'ngo.annamrita@foodbridge.org', '+91 94400 44556', 'NGO'),
(6, 'Hope Shelter Community', 'ngo.hope@foodbridge.org', '+91 94400 77889', 'NGO'),
(7, 'FoodBridge System Admin', 'admin@foodbridge.org', '+91 99999 00000', 'ADMIN');

-- 3. Insert Donors
INSERT INTO donors (donor_id, user_id, organization_name, donor_type, location_id, address_line, contact_person, fssai_license) VALUES
(1, 1, 'Sri Krishna Grand Restaurant', 'RESTAURANT', 1, 'Opposite Sub-Collector Office, Gandhinagar', 'Ramesh Kumar', '10121000123456'),
(2, 2, 'VNR College Hostel Mess', 'HOSTEL', 2, 'Near Benz Circle, Ring Road', 'P. Srinivas', '10121000789012'),
(3, 3, 'Royal Event Caterers', 'EVENT', 3, '1st Line, Arundelpet, Guntur', 'K. Venkatesh', '10121000345678');

-- 4. Insert NGOs
INSERT INTO ngos (ngo_id, user_id, organization_name, registration_number, location_id, address_line, contact_person, capacity_servings) VALUES
(1, 4, 'Seva Food Relief Foundation', 'NGO-AP-VIJ-2018-092', 1, 'Bunder Road, Gandhinagar, Vijayawada', 'Smt. Lakshmi Devi', 200),
(2, 5, 'Annamrita Community Kitchen', 'NGO-AP-VIJ-2020-144', 2, 'MG Road, Vijayawada', 'Rajesh Sharma', 350),
(3, 6, 'Hope Child & Elderly Shelter', 'NGO-AP-GUN-2019-078', 3, 'Main Road, Arundelpet, Guntur', 'Mary Joseph', 120);

-- 5. Insert Food Categories
INSERT INTO food_categories (category_id, category_name, description) VALUES
(1, 'Cooked Food', 'Freshly prepared meals, curries, rice, breads'),
(2, 'Packaged Food', 'Sealed groceries, biscuits, dry rations, tins'),
(3, 'Fruits & Vegetables', 'Fresh produce, whole raw fruits and veggies'),
(4, 'Bakery & Confectionery', 'Bread loaves, buns, pastries, baked goods'),
(5, 'Beverages & Dairy', 'Milk packets, juices, butter, curd containers'),
(6, 'Other Surplus', 'Miscellaneous edible food items');

-- 6. Insert Donations (With realistic relative timestamps)
-- Note: In practical SQL, NOW() + INTERVAL is used for realistic active times
INSERT INTO donations (donation_id, donor_id, ngo_id, food_name, dietary_type, category_id, cuisine, quantity, unit, prepared_at, best_before, storage_condition, description, location_id, status) VALUES
-- 101: Urgent available donation (expires in ~1.5 hours)
(101, 1, NULL, 'Vegetable Pulao & Mix Dal', 'VEGETARIAN', 1, 'INDIAN', 35, 'PORTIONS', 
 DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 90 MINUTE), 'HEATED', 
 'Freshly prepared aromatic basmati pulao with yellow tadka dal from lunch buffet. Kept in warm insulated containers.', 1, 'AVAILABLE'),

-- 102: Available donation (expires in ~4 hours - moderate urgency)
(102, 1, NULL, 'Hyderabadi Veg Biryani & Salan', 'VEGETARIAN', 1, 'INDIAN', 25, 'PORTIONS', 
 DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 4 HOUR), 'HEATED', 
 'Surplus high quality vegetable dum biryani with mirchi ka salan and raita pouches.', 2, 'AVAILABLE'),

-- 103: Packaged rations (expires in 2 days)
(103, 3, NULL, 'Sealed Wheat Bread Loaves & Jam', 'VEGETARIAN', 4, 'OTHER', 20, 'PACKETS', 
 DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_ADD(NOW(), INTERVAL 48 HOUR), 'ROOM_TEMPERATURE', 
 'Unopened whole wheat sandwich bread loaves from catering breakfast counter.', 3, 'AVAILABLE'),

-- 104: Accepted donation (claimed by Seva NGO, pending pickup scheduling)
(104, 1, 1, 'South Indian Meals (Sambar, Rice, Poriyal)', 'VEGETARIAN', 1, 'INDIAN', 40, 'PORTIONS', 
 DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'ROOM_TEMPERATURE', 
 'Steamed sona masoori rice with drumstick sambar and cabbage poriyal in food-grade buckets.', 1, 'ACCEPTED'),

-- 105: Pickup Scheduled (Seva NGO scheduled pickup)
(105, 2, 1, 'Chapati & Mixed Vegetable Curry', 'VEGAN', 1, 'INDIAN', 50, 'PORTIONS', 
 DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_ADD(NOW(), INTERVAL 3 HOUR), 'ROOM_TEMPERATURE', 
 'Soft whole wheat chapatis with rich vegetable curry from evening student mess.', 2, 'PICKUP_SCHEDULED'),

-- 106: Completed donation (successfully rescued yesterday)
(106, 1, 1, 'Paneer Butter Masala & Jeera Rice', 'VEGETARIAN', 1, 'INDIAN', 30, 'PORTIONS', 
 DATE_SUB(NOW(), INTERVAL 28 HOUR), DATE_SUB(NOW(), INTERVAL 20 HOUR), 'REFRIGERATED', 
 'Dinner banquet surplus successfully collected and distributed to street shelter.', 1, 'COMPLETED'),

-- 107: Expired donation (passed best before date safely recorded in audit)
(107, 3, NULL, 'Cut Fruit Salad Bowls', 'VEGAN', 3, 'OTHER', 15, 'BOXES', 
 DATE_SUB(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), 'REFRIGERATED', 
 'Assorted seasonal watermelon and papaya fruit bowls.', 3, 'EXPIRED');

-- 7. Insert Pickup Requests
INSERT INTO pickup_requests (pickup_id, donation_id, ngo_id, pickup_date, pickup_time, contact_person, contact_phone, vehicle_type, notes, status) VALUES
(201, 105, 1, CURDATE(), '19:30:00', 'Volunteer R. Kumar', '+91 94400 11223', 'Maruti Eeco Van (Insulated)', 'Donor confirmed gate 2 entrance for pickup', 'SCHEDULED'),
(202, 106, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '21:00:00', 'Volunteer S. Rao', '+91 94400 11223', 'Three-Wheeler Auto', 'Smooth collection, food quality verified', 'COLLECTED');

-- 8. Insert Notifications
INSERT INTO notifications (notification_id, user_id, title, message, type, is_read) VALUES
(1, 1, 'Donation Accepted!', 'Seva Food Relief Foundation accepted your donation: South Indian Meals (40 portions).', 'SUCCESS', FALSE),
(2, 1, 'Pickup Scheduled', 'Pickup for Chapati & Veg Curry has been scheduled by Seva Food Relief for today at 7:30 PM.', 'INFO', TRUE),
(3, 4, 'Urgent Food Available', 'Sri Krishna Grand listed Vegetable Pulao (35 portions) expiring in less than 2 hours.', 'WARNING', FALSE);
