-- ================================================================
-- FoodBridge Database Schema
-- Simple Relational Database for Food Donation Platform across India
-- ================================================================

-- 1. Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS foodbridge_db;
USE foodbridge_db;

-- 2. Drop existing tables in reverse dependency order (if resetting)
DROP TABLE IF EXISTS pickups;
DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS users;

-- ================================================================
-- Table 1: USERS
-- Stores Donors (Restaurants, Caterers, Individuals) & NGOs
-- ================================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,          -- Unique ID for each user (Primary Key)
    name VARCHAR(100) NOT NULL,                 -- Name of restaurant, individual, or NGO
    email VARCHAR(100) NOT NULL UNIQUE,         -- Contact email (must be unique)
    role ENUM('DONOR', 'NGO') NOT NULL,         -- User role: 'DONOR' or 'NGO'
    state VARCHAR(50) NOT NULL,                 -- Indian State (e.g., 'Andhra Pradesh', 'Telangana')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Record creation timestamp
);

-- ================================================================
-- Table 2: DONATIONS
-- Stores surplus food items registered by donors
-- ================================================================
CREATE TABLE donations (
    id INT AUTO_INCREMENT PRIMARY KEY,          -- Unique ID for each donation (Primary Key)
    donor_id INT NOT NULL,                      -- Linked Donor user ID (Foreign Key)
    food_name VARCHAR(150) NOT NULL,            -- Name/description of the food item
    food_type VARCHAR(50) NOT NULL,             -- 'Veg', 'Non-Veg', 'Vegan', 'Other'
    category VARCHAR(50) NOT NULL,              -- 'Cooked Food', 'Packaged Food', 'Bakery', 'Fruits & Vegetables', 'Other'
    quantity DECIMAL(8,2) NOT NULL,             -- Numerical quantity (e.g., 25.50)
    unit VARCHAR(20) NOT NULL,                  -- Unit of measure ('Kg', 'Litres', 'Items', 'Packets', 'Boxes')
    prepared_time DATETIME NOT NULL,            -- When food was prepared/cooked
    expiry_time DATETIME NOT NULL,              -- Safe consumption cut-off time
    state VARCHAR(50) NOT NULL,                 -- State in India where food is located
    pickup_location VARCHAR(255) NOT NULL,      -- Full address / landmark for pickup
    description TEXT,                           -- Storage instructions or dietary notes
    status ENUM('AVAILABLE', 'ACCEPTED', 'PICKED UP', 'DELIVERED', 'EXPIRED') DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When donation was listed
    
    -- Relationship: Each donation belongs to a user in the 'users' table
    CONSTRAINT fk_donations_donor FOREIGN KEY (donor_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- ================================================================
-- Table 3: PICKUPS
-- Tracks NGO claims, pickup dispatch, and final delivery
-- ================================================================
CREATE TABLE pickups (
    id INT AUTO_INCREMENT PRIMARY KEY,          -- Unique ID for each pickup record
    donation_id INT NOT NULL,                   -- Linked donation ID (Foreign Key)
    ngo_id INT NOT NULL,                        -- Linked NGO user ID (Foreign Key)
    status ENUM('ACCEPTED', 'PICKED UP', 'DELIVERED') DEFAULT 'ACCEPTED',
    pickup_time DATETIME DEFAULT NULL,          -- When NGO volunteer collected the food
    delivery_time DATETIME DEFAULT NULL,        -- When food was distributed to community
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key constraints
    CONSTRAINT fk_pickups_donation FOREIGN KEY (donation_id) 
        REFERENCES donations(id) ON DELETE CASCADE,
    CONSTRAINT fk_pickups_ngo FOREIGN KEY (ngo_id) 
        REFERENCES users(id) ON DELETE CASCADE
);
