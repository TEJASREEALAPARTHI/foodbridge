// ================================================================
// backend/routes/donationRoutes.js
// Express Router for FoodBridge API Endpoints & Auth
// ================================================================

const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

// --- AUTHENTICATION ROUTES ---
router.post('/auth/login', donationController.login);
router.post('/auth/signup', donationController.signup);

// --- DONATION ROUTES ---
// 1. Get all donations (optional ?state=...&status=...)
router.get('/donations', donationController.getAllDonations);

// 2. Get aggregate statistics
router.get('/stats', donationController.getStats);

// 3. Get single donation by ID
router.get('/donations/:id', donationController.getDonationById);

// 4. Register a new surplus food donation
router.post('/donations', donationController.createDonation);

// 5. NGO accepts an available donation (AVAILABLE -> ACCEPTED)
router.put('/donations/:id/accept', donationController.acceptDonation);

// 6. NGO/Volunteer marks food as picked up (ACCEPTED -> PICKED UP)
router.put('/donations/:id/pickup', donationController.pickupDonation);

// 7. NGO marks food as delivered to shelter (PICKED UP -> DELIVERED)
router.put('/donations/:id/deliver', donationController.deliverDonation);

module.exports = router;
