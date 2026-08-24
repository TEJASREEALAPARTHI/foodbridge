// ================================================================
// backend/controllers/donationController.js
// Handles business logic, auth, and database operations for FoodBridge
// ================================================================

const db = require('../db');

// ================================================================
// AUTHENTICATION CONTROLLERS (LOGIN & SIGNUP)
// ================================================================

// 1. USER LOGIN
// Route: POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password'
            });
        }

        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim()]);

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = rows[0];

        // Simple password comparison
        if (user.password && user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                state: user.state
            }
        });
    } catch (error) {
        console.error('[Controller Error] login:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// 2. USER SIGNUP
// Route: POST /api/auth/signup
exports.signup = async (req, res) => {
    try {
        const { name, email, role, state, password } = req.body;

        if (!name || !email || !role || !state || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all registration fields'
            });
        }

        // Check if email already registered
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim()]);
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        const sql = 'INSERT INTO users (name, email, role, state, password) VALUES (?, ?, ?, ?, ?)';
        const params = [name.trim(), email.trim().toLowerCase(), role, state, password];

        const [result] = await db.query(sql, params);
        const newId = result.insertId || result[0]?.insertId || 99;

        return res.status(201).json({
            success: true,
            message: 'Registration successful! Welcome to FoodBridge.',
            user: {
                id: newId,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                role: role,
                state: state
            }
        });
    } catch (error) {
        console.error('[Controller Error] signup:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during signup'
        });
    }
};

// ================================================================
// DONATION CONTROLLERS (CRUD & LIFECYCLE)
// ================================================================

// 3. GET ALL DONATIONS
// Route: GET /api/donations?state=Telangana&status=AVAILABLE
exports.getAllDonations = async (req, res) => {
    try {
        const { state, status, category } = req.query;
        let sql = 'SELECT * FROM donations WHERE 1=1';
        const params = [];

        if (state && state.trim() !== '') {
            sql += ' AND state = ?';
            params.push(state.trim());
        }

        if (status && status.trim() !== '') {
            sql += ' AND status = ?';
            params.push(status.trim());
        }

        if (category && category.trim() !== '') {
            sql += ' AND category = ?';
            params.push(category.trim());
        }

        sql += ' ORDER BY created_at DESC';

        const [donations] = await db.query(sql, params);
        
        return res.status(200).json({
            success: true,
            count: donations.length,
            data: donations
        });
    } catch (error) {
        console.error('[Controller Error] getAllDonations:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching donations'
        });
    }
};

// 4. GET SINGLE DONATION BY ID
// Route: GET /api/donations/:id
exports.getDonationById = async (req, res) => {
    try {
        const donationId = req.params.id;
        const [rows] = await db.query('SELECT * FROM donations WHERE id = ?', [donationId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Donation with ID ${donationId} not found`
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('[Controller Error] getDonationById:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching donation details'
        });
    }
};

// 5. GET DASHBOARD STATISTICS
// Route: GET /api/stats
exports.getStats = async (req, res) => {
    try {
        const [allDonations] = await db.query('SELECT status FROM donations');

        const total = allDonations.length;
        const available = allDonations.filter(d => d.status === 'AVAILABLE').length;
        const accepted = allDonations.filter(d => d.status === 'ACCEPTED').length;
        const pickedUp = allDonations.filter(d => d.status === 'PICKED UP').length;
        const delivered = allDonations.filter(d => d.status === 'DELIVERED').length;

        return res.status(200).json({
            success: true,
            data: {
                total,
                available,
                accepted,
                pickedUp,
                delivered
            }
        });
    } catch (error) {
        console.error('[Controller Error] getStats:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching statistics'
        });
    }
};

// 6. CREATE NEW DONATION
// Route: POST /api/donations
exports.createDonation = async (req, res) => {
    try {
        const {
            food_name,
            food_type,
            category,
            quantity,
            unit,
            prepared_time,
            expiry_time,
            state,
            pickup_location,
            description,
            donor_id = 1
        } = req.body;

        if (!food_name || !food_type || !category || !quantity || !unit || !prepared_time || !expiry_time || !state || !pickup_location) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required donation fields'
            });
        }

        if (Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than zero'
            });
        }

        const sql = `
            INSERT INTO donations 
            (donor_id, food_name, food_type, category, quantity, unit, prepared_time, expiry_time, state, pickup_location, description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')
        `;

        const params = [
            donor_id,
            food_name.trim(),
            food_type,
            category,
            parseFloat(quantity),
            unit,
            prepared_time,
            expiry_time,
            state,
            pickup_location.trim(),
            description ? description.trim() : ''
        ];

        const [result] = await db.query(sql, params);

        return res.status(201).json({
            success: true,
            message: 'Surplus food donation registered successfully!',
            donationId: result.insertId || result[0]?.insertId
        });
    } catch (error) {
        console.error('[Controller Error] createDonation:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while creating donation'
        });
    }
};

// 7. ACCEPT DONATION (AVAILABLE -> ACCEPTED)
// Route: PUT /api/donations/:id/accept
exports.acceptDonation = async (req, res) => {
    try {
        const donationId = req.params.id;

        const [result] = await db.query(
            "UPDATE donations SET status = 'ACCEPTED' WHERE id = ? AND status = 'AVAILABLE'",
            [donationId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: 'Donation is either already accepted or not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Donation accepted successfully by NGO!'
        });
    } catch (error) {
        console.error('[Controller Error] acceptDonation:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while accepting donation'
        });
    }
};

// 8. MARK PICKED UP (ACCEPTED -> PICKED UP)
// Route: PUT /api/donations/:id/pickup
exports.pickupDonation = async (req, res) => {
    try {
        const donationId = req.params.id;

        const [result] = await db.query(
            "UPDATE donations SET status = 'PICKED UP' WHERE id = ? AND status = 'ACCEPTED'",
            [donationId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: 'Donation must be in ACCEPTED status before marking as Picked Up'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Donation marked as Picked Up!'
        });
    } catch (error) {
        console.error('[Controller Error] pickupDonation:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating pickup status'
        });
    }
};

// 9. MARK DELIVERED (PICKED UP -> DELIVERED)
// Route: PUT /api/donations/:id/deliver
exports.deliverDonation = async (req, res) => {
    try {
        const donationId = req.params.id;

        const [result] = await db.query(
            "UPDATE donations SET status = 'DELIVERED' WHERE id = ? AND status = 'PICKED UP'",
            [donationId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: 'Donation must be in PICKED UP status before marking as Delivered'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Donation marked as Delivered to community shelter!'
        });
    } catch (error) {
        console.error('[Controller Error] deliverDonation:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating delivery status'
        });
    }
};
