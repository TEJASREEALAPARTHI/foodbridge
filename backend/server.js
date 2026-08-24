// ================================================================
// backend/server.js - Express Server Entry Point
// ================================================================
// EXPLANATION FOR INTERVIEWS:
// 1. Express is a minimalist web framework for Node.js.
// 2. express.json() is middleware that automatically parses JSON in request bodies.
// 3. cors() enables Cross-Origin Resource Sharing if frontend runs on another port.
// 4. express.static() serves frontend HTML, CSS, JavaScript, and image assets.
// 5. app.listen() starts the HTTP server listening on the specified port.
// ================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const donationRoutes = require('./routes/donationRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// Mount API routes under /api
app.use('/api', donationRoutes);

// Root route fallback to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        service: 'FoodBridge API'
    });
});

// Start Server
app.listen(PORT, () => {
    console.log('================================================================');
    console.log(`🚀 FoodBridge Server running on http://localhost:${PORT}`);
    console.log(`🍲 Landing Page & Portals: http://localhost:${PORT}`);
    console.log(`📡 API Endpoints: http://localhost:${PORT}/api/donations`);
    console.log('================================================================');
});
