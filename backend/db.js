// ================================================================
// backend/db.js - MySQL Database Connection & Query Engine
// ================================================================

require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'foodbridge_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool = null;
let isConnectedToMySQL = false;

// Sample registered users (Donors & NGOs) for instant login & offline mode
let memoryUsers = [
    {
        id: 1,
        name: 'Annapurna Grand Restaurant',
        email: 'donor@annapurna.in',
        password: 'password123',
        role: 'DONOR',
        state: 'Andhra Pradesh',
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        name: 'Paradise Royal Biryani',
        email: 'paradise@biryani.in',
        password: 'password123',
        role: 'DONOR',
        state: 'Telangana',
        created_at: new Date().toISOString()
    },
    {
        id: 7,
        name: 'Seva Food Rescue Foundation',
        email: 'ngo@seva.org',
        password: 'password123',
        role: 'NGO',
        state: 'Andhra Pradesh',
        created_at: new Date().toISOString()
    },
    {
        id: 8,
        name: 'Hope For All Community Trust',
        email: 'hope@trust.org',
        password: 'password123',
        role: 'NGO',
        state: 'Telangana',
        created_at: new Date().toISOString()
    }
];

let nextUserId = 13;

// In-memory fallback dataset for donations
let memoryDonations = [
    {
        id: 1,
        donor_id: 1,
        donor_name: 'Annapurna Grand Restaurant',
        food_name: 'Vegetable Pulao & Mixed Dal',
        food_type: 'Veg',
        category: 'Cooked Food',
        quantity: 25.0,
        unit: 'Kg',
        prepared_time: new Date(Date.now() - 2 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        expiry_time: new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        state: 'Andhra Pradesh',
        pickup_location: 'Opp. Bus Station, MG Road, Vijayawada',
        description: 'Freshly packed in sanitized food grade containers.',
        status: 'AVAILABLE',
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    },
    {
        id: 2,
        donor_id: 1,
        donor_name: 'Annapurna Grand Restaurant',
        food_name: 'Fresh Bakery Buns & Bread',
        food_type: 'Veg',
        category: 'Bakery',
        quantity: 40.0,
        unit: 'Packets',
        prepared_time: new Date(Date.now() - 4 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        expiry_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        state: 'Andhra Pradesh',
        pickup_location: 'Shop #12, Arundelpet, Guntur',
        description: 'Unsold fresh batch from morning bake.',
        status: 'AVAILABLE',
        created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    },
    {
        id: 3,
        donor_id: 2,
        donor_name: 'Paradise Royal Biryani',
        food_name: 'Hyderabadi Dum Biryani',
        food_type: 'Non-Veg',
        category: 'Cooked Food',
        quantity: 30.0,
        unit: 'Packets',
        prepared_time: new Date(Date.now() - 1 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        expiry_time: new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        state: 'Telangana',
        pickup_location: 'Near Clock Tower, Secunderabad, Hyderabad',
        description: 'Sealed dinner buffet surplus packets.',
        status: 'AVAILABLE',
        created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    },
    {
        id: 4,
        donor_id: 2,
        donor_name: 'Paradise Royal Biryani',
        food_name: 'Paneer Butter Masala & Roti',
        food_type: 'Veg',
        category: 'Cooked Food',
        quantity: 18.0,
        unit: 'Boxes',
        prepared_time: new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        expiry_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        state: 'Telangana',
        pickup_location: 'Road No. 36, Jubilee Hills, Hyderabad',
        description: 'Hot container packing with disposable cutlery.',
        status: 'ACCEPTED',
        created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    },
    {
        id: 5,
        donor_id: 3,
        donor_name: 'Udupi Heritage Kitchen',
        food_name: 'South Indian Meals (Rice, Sambar, Poriyal)',
        food_type: 'Veg',
        category: 'Cooked Food',
        quantity: 35.0,
        unit: 'Boxes',
        prepared_time: new Date(Date.now() - 2 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        expiry_time: new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        state: 'Karnataka',
        pickup_location: '8th Cross, Malleshwaram, Bengaluru',
        description: 'Pure vegetarian canteen surplus meals.',
        status: 'AVAILABLE',
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    },
    {
        id: 6,
        donor_id: 3,
        donor_name: 'Udupi Heritage Kitchen',
        food_name: 'Fresh Bananas & Apples',
        food_type: 'Vegan',
        category: 'Fruits & Vegetables',
        quantity: 20.0,
        unit: 'Kg',
        prepared_time: new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        expiry_time: new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        state: 'Karnataka',
        pickup_location: 'Near Metro Station, Indiranagar, Bengaluru',
        description: 'High nutrition fresh fruit crates.',
        status: 'PICKED UP',
        created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    },
    {
        id: 7,
        donor_id: 4,
        donor_name: 'Saravana Bhavan Caterers',
        food_name: 'Curd Rice & Pickle Packets',
        food_type: 'Veg',
        category: 'Cooked Food',
        quantity: 50.0,
        unit: 'Packets',
        prepared_time: new Date(Date.now() - 2 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        expiry_time: new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        state: 'Tamil Nadu',
        pickup_location: 'North Usman Road, T. Nagar, Chennai',
        description: 'Cool & hygienic packaging.',
        status: 'AVAILABLE',
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    },
    {
        id: 8,
        donor_id: 4,
        donor_name: 'Saravana Bhavan Caterers',
        food_name: 'Assorted Sweets & Snack Boxes',
        food_type: 'Veg',
        category: 'Bakery',
        quantity: 15.0,
        unit: 'Boxes',
        prepared_time: new Date(Date.now() - 12 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        expiry_time: new Date(Date.now() + 36 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        state: 'Tamil Nadu',
        pickup_location: 'Gandhi Road, Vellore',
        description: 'Festival surplus sweet gift boxes.',
        status: 'DELIVERED',
        created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    },
    {
        id: 9,
        donor_id: 5,
        donor_name: 'Mumbai Feast Banquets',
        food_name: 'Pav Bhaji & Veg Pulao Combo',
        food_type: 'Veg',
        category: 'Cooked Food',
        quantity: 45.0,
        unit: 'Boxes',
        prepared_time: new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        expiry_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        state: 'Maharashtra',
        pickup_location: 'Link Road, Andheri West, Mumbai',
        description: 'Banquet hall surplus fresh buffet food.',
        status: 'AVAILABLE',
        created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    },
    {
        id: 10,
        donor_id: 6,
        donor_name: 'Delhi Flavours Sweet House',
        food_name: 'Rajma Chawal Lunch Boxes',
        food_type: 'Veg',
        category: 'Cooked Food',
        quantity: 30.0,
        unit: 'Boxes',
        prepared_time: new Date(Date.now() - 2 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        expiry_time: new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        state: 'Delhi',
        pickup_location: 'Block B, Connaught Place, New Delhi',
        description: 'Corporate event surplus boxed meals.',
        status: 'AVAILABLE',
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    }
];

let nextDonationId = 11;

async function initializeDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        isConnectedToMySQL = true;
        console.log(`[Database] Successfully connected to MySQL at ${dbConfig.host}:${dbConfig.database}`);
    } catch (err) {
        isConnectedToMySQL = false;
        console.log(`[Database] Notice: MySQL not connected (${err.message}).`);
        console.log(`[Database] Running in Fallback Mode with Indian sample data.`);
    }
}

initializeDatabase();

module.exports = {
    isMySQLConnected: () => isConnectedToMySQL,

    query: async (sql, params = []) => {
        if (isConnectedToMySQL && pool) {
            const [rows] = await pool.query(sql, params);
            return [rows];
        }

        const trimmedSql = sql.trim().toUpperCase();

        // 1. SELECT Users Query
        if (trimmedSql.includes('FROM USERS')) {
            if (trimmedSql.includes('EMAIL = ?') && params.length > 0) {
                const user = memoryUsers.find(u => u.email.toLowerCase() === params[0].toLowerCase());
                return [user ? [user] : []];
            }
            return [memoryUsers];
        }

        // 2. INSERT User (Signup)
        if (trimmedSql.startsWith('INSERT INTO USERS')) {
            const newUser = {
                id: nextUserId++,
                name: params[0],
                email: params[1],
                role: params[2],
                state: params[3],
                password: params[4] || 'password123',
                created_at: new Date().toISOString()
            };
            memoryUsers.push(newUser);
            return [{ insertId: newUser.id, affectedRows: 1 }];
        }

        // 3. SELECT Donations
        if (trimmedSql.startsWith('SELECT')) {
            let results = [...memoryDonations];

            if (trimmedSql.includes('COUNT(') || trimmedSql.includes('SUM(')) {
                const total = memoryDonations.length;
                const available = memoryDonations.filter(d => d.status === 'AVAILABLE').length;
                const accepted = memoryDonations.filter(d => d.status === 'ACCEPTED').length;
                const pickedUp = memoryDonations.filter(d => d.status === 'PICKED UP').length;
                const delivered = memoryDonations.filter(d => d.status === 'DELIVERED').length;
                return [[{ total, available, accepted, pickedUp, delivered }]];
            }

            if (sql.includes('state = ?') && params.length > 0) {
                const stateParam = params[0];
                results = results.filter(d => d.state.toLowerCase() === stateParam.toLowerCase());
            }

            if (sql.includes("status = 'AVAILABLE'") || sql.includes("status = ?")) {
                const statusParam = params.find(p => ['AVAILABLE', 'ACCEPTED', 'PICKED UP', 'DELIVERED', 'EXPIRED'].includes(p)) || 'AVAILABLE';
                results = results.filter(d => d.status === statusParam);
            }

            if (sql.includes('id = ?') && params.length > 0) {
                const idParam = Number(params[0]);
                results = results.filter(d => d.id === idParam);
            }

            results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return [results];
        }

        // 4. INSERT Donation
        if (trimmedSql.startsWith('INSERT INTO DONATIONS')) {
            const newDonation = {
                id: nextDonationId++,
                donor_id: params[0] || 1,
                food_name: params[1],
                food_type: params[2],
                category: params[3],
                quantity: parseFloat(params[4]),
                unit: params[5],
                prepared_time: params[6],
                expiry_time: params[7],
                state: params[8],
                pickup_location: params[9],
                description: params[10] || '',
                status: 'AVAILABLE',
                created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            };
            memoryDonations.unshift(newDonation);
            return [{ insertId: newDonation.id, affectedRows: 1 }];
        }

        // 5. UPDATE Donation
        if (trimmedSql.startsWith('UPDATE DONATIONS')) {
            const donationId = Number(params[params.length - 1]);
            const donation = memoryDonations.find(d => d.id === donationId);

            if (donation) {
                if (trimmedSql.includes("STATUS = 'ACCEPTED'")) donation.status = 'ACCEPTED';
                else if (trimmedSql.includes("STATUS = 'PICKED UP'")) donation.status = 'PICKED UP';
                else if (trimmedSql.includes("STATUS = 'DELIVERED'")) donation.status = 'DELIVERED';
                else if (trimmedSql.includes("STATUS = ?")) {
                    donation.status = params[0];
                }
                return [{ affectedRows: 1, changedRows: 1 }];
            }
            return [{ affectedRows: 0, changedRows: 0 }];
        }

        return [[]];
    }
};
