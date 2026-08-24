-- ==========================================================
-- FOODBRIDGE SQL QUERIES (TCS Digital Interview Reference)
-- Demonstrates Normalization, JOINs, Aggregations, & Filtering
-- ==========================================================

-- ----------------------------------------------------------
-- 1. SINGLE SOURCE OF TRUTH: GET DONOR DASHBOARD METRICS
-- Calculates live counts directly from the donations table
-- ----------------------------------------------------------
SELECT 
    COUNT(CASE WHEN status = 'AVAILABLE' THEN 1 END) AS active_donations,
    COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) AS accepted_donations,
    COUNT(CASE WHEN status = 'PICKUP_SCHEDULED' THEN 1 END) AS pickup_scheduled_donations,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) AS completed_donations,
    COUNT(CASE WHEN status = 'EXPIRED' THEN 1 END) AS expired_donations,
    COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN quantity ELSE 0 END), 0) AS total_portions_rescued
FROM donations
WHERE donor_id = 1;

-- ----------------------------------------------------------
-- 2. GET NGO DASHBOARD METRICS
-- ----------------------------------------------------------
SELECT 
    (SELECT COUNT(*) FROM donations WHERE status = 'AVAILABLE' AND best_before > NOW()) AS available_in_platform,
    COUNT(CASE WHEN d.status = 'ACCEPTED' THEN 1 END) AS pending_pickup_scheduling,
    COUNT(CASE WHEN d.status = 'PICKUP_SCHEDULED' THEN 1 END) AS scheduled_pickups,
    COUNT(CASE WHEN d.status = 'COMPLETED' THEN 1 END) AS total_rescued_by_ngo,
    COALESCE(SUM(CASE WHEN d.status = 'COMPLETED' THEN d.quantity ELSE 0 END), 0) AS total_meals_distributed
FROM donations d
WHERE d.ngo_id = 1;

-- ----------------------------------------------------------
-- 3. NGO "FIND AVAILABLE FOOD" QUERY WITH MULTI-TABLE JOIN
-- Ensures only AVAILABLE, unexpired food is retrieved with donor & location info
-- ----------------------------------------------------------
SELECT 
    d.donation_id,
    d.food_name,
    d.dietary_type,
    fc.category_name,
    d.cuisine,
    d.quantity,
    d.unit,
    d.prepared_at,
    d.best_before,
    d.storage_condition,
    d.description,
    d.status,
    dn.organization_name AS donor_name,
    dn.donor_type,
    l.state,
    l.city,
    l.locality,
    TIMESTAMPDIFF(MINUTE, NOW(), d.best_before) AS minutes_remaining
FROM donations d
INNER JOIN donors dn ON d.donor_id = dn.donor_id
INNER JOIN food_categories fc ON d.category_id = fc.category_id
INNER JOIN locations l ON d.location_id = l.location_id
WHERE d.status = 'AVAILABLE'
  AND d.best_before > NOW()
  -- Optional dynamic filters:
  -- AND l.state = 'Andhra Pradesh'
  -- AND l.city = 'Vijayawada'
  -- AND d.dietary_type = 'VEGETARIAN'
ORDER BY d.best_before ASC; -- Expiry Urgency Priority (Soonest expiring first)

-- ----------------------------------------------------------
-- 4. DONOR RECENT DONATIONS LIST (Live Query)
-- ----------------------------------------------------------
SELECT 
    d.donation_id,
    d.food_name,
    d.quantity,
    d.unit,
    d.dietary_type,
    fc.category_name,
    d.best_before,
    d.status,
    d.created_at,
    n.organization_name AS claiming_ngo_name
FROM donations d
INNER JOIN food_categories fc ON d.category_id = fc.category_id
LEFT JOIN ngos n ON d.ngo_id = n.ngo_id
WHERE d.donor_id = 1
ORDER BY d.created_at DESC;

-- ----------------------------------------------------------
-- 5. ATOMIC DONATION ACCEPTANCE QUERY (Prevents Double Acceptance)
-- Uses optimistic locking condition 'WHERE status = 'AVAILABLE' AND best_before > NOW()'
-- ----------------------------------------------------------
UPDATE donations
SET 
    status = 'ACCEPTED',
    ngo_id = 1,
    updated_at = NOW()
WHERE donation_id = 101 
  AND status = 'AVAILABLE' 
  AND best_before > NOW();

-- ----------------------------------------------------------
-- 6. SCHEDULE PICKUP QUERY (Transaction Flow)
-- ----------------------------------------------------------
-- Step A: Insert Pickup Record
INSERT INTO pickup_requests (donation_id, ngo_id, pickup_date, pickup_time, contact_person, contact_phone, vehicle_type, notes, status)
VALUES (104, 1, '2026-08-24', '18:00:00', 'Volunteer Priya', '+91 94400 11223', 'Electric Auto', 'Pickup from rear canteen gate', 'SCHEDULED');

-- Step B: Update Donation Status
UPDATE donations 
SET status = 'PICKUP_SCHEDULED', updated_at = NOW()
WHERE donation_id = 104 AND status = 'ACCEPTED';

-- ----------------------------------------------------------
-- 7. COMPLETE PICKUP QUERY
-- ----------------------------------------------------------
UPDATE pickup_requests 
SET status = 'COLLECTED', updated_at = NOW()
WHERE pickup_id = 201;

UPDATE donations 
SET status = 'COMPLETED', updated_at = NOW()
WHERE donation_id = 105;

-- ----------------------------------------------------------
-- 8. AUTOMATIC EXPIRY AUDIT QUERY
-- Marks any lingering available donations whose best_before time has passed
-- ----------------------------------------------------------
UPDATE donations
SET status = 'EXPIRED', updated_at = NOW()
WHERE status = 'AVAILABLE' AND best_before <= NOW();
