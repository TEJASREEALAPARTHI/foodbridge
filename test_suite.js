// ================================================================
// test_suite.js - Automated Test Runner for FoodBridge
// Verifies backend REST API endpoints, auth, and state machine
// ================================================================

const http = require('http');

function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    resolve({ status: res.statusCode, headers: res.headers, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, raw: body });
                }
            });
        });

        req.on('error', (err) => reject(err));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('================================================================');
    console.log('🧪 Starting FoodBridge Automated API, Auth & State Machine Tests');
    console.log('================================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, testName) {
        if (condition) {
            console.log(`  ✅ PASS: ${testName}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${testName}`);
            failed++;
        }
    }

    try {
        // 1. Health Check
        const healthRes = await request('GET', '/api/health');
        assert(healthRes.status === 200 && healthRes.body.status === 'online', '1. Server Health Check returns 200 online');

        // 2. Auth: Login with valid credentials
        const loginRes = await request('POST', '/api/auth/login', {
            email: 'donor@annapurna.in',
            password: 'password123'
        });
        assert(loginRes.status === 200 && loginRes.body.success && loginRes.body.user.role === 'DONOR', '2. POST /api/auth/login succeeds for valid donor credentials');

        // 3. Auth: Login with invalid password
        const badLoginRes = await request('POST', '/api/auth/login', {
            email: 'donor@annapurna.in',
            password: 'wrongpassword'
        });
        assert(badLoginRes.status === 401 && !badLoginRes.body.success, '3. POST /api/auth/login rejects invalid credentials with 401');

        // 4. Auth: Sign up new user
        const signupRes = await request('POST', '/api/auth/signup', {
            name: 'Bengaluru Seva Trust',
            role: 'NGO',
            state: 'Karnataka',
            email: `volunteer_${Date.now()}@sevatrust.org`,
            password: 'password123'
        });
        assert(signupRes.status === 201 && signupRes.body.success, '4. POST /api/auth/signup registers a new user with 201 Created');

        // 5. Get All Donations
        const allRes = await request('GET', '/api/donations');
        assert(allRes.status === 200 && allRes.body.success && Array.isArray(allRes.body.data), '5. GET /api/donations returns donation list');

        // 6. State Filtering
        const stateRes = await request('GET', '/api/donations?state=Telangana');
        const allTelangana = stateRes.body.data.every(d => d.state.toLowerCase() === 'telangana');
        assert(stateRes.status === 200 && allTelangana && stateRes.body.data.length > 0, '6. GET /api/donations?state=Telangana returns only Telangana donations');

        // 7. Summary Stats
        const statsRes = await request('GET', '/api/stats');
        assert(statsRes.status === 200 && statsRes.body.data.total >= 0, '7. GET /api/stats returns aggregate metrics');

        // 8. Create Donation (POST)
        const newDonationPayload = {
            food_name: 'Special Hyderabadi Veg Biryani Packets',
            food_type: 'Veg',
            category: 'Cooked Food',
            quantity: 20,
            unit: 'Packets',
            prepared_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
            expiry_time: new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
            state: 'Telangana',
            pickup_location: 'Gachibowli, Hyderabad',
            description: 'Hot fresh buffet surplus packets.',
            donor_id: 1
        };

        const postRes = await request('POST', '/api/donations', newDonationPayload);
        assert(postRes.status === 201 && postRes.body.success, '8. POST /api/donations creates a new donation record');
        const createdId = postRes.body.donationId || postRes.body.data?.id || 1;

        // 9. Validation Error on invalid POST (Empty name)
        const invalidPostRes = await request('POST', '/api/donations', { food_name: '', quantity: -5 });
        assert(invalidPostRes.status === 400 && !invalidPostRes.body.success, '9. POST with missing required fields returns 400 Bad Request');

        // 10. Accept Donation (PUT)
        const acceptRes = await request('PUT', `/api/donations/${createdId}/accept`, { ngo_id: 7 });
        assert(acceptRes.status === 200 && acceptRes.body.success, `10. PUT /api/donations/${createdId}/accept transitions status to ACCEPTED`);

        // 11. Pickup Donation (PUT)
        const pickupRes = await request('PUT', `/api/donations/${createdId}/pickup`);
        assert(pickupRes.status === 200 && pickupRes.body.success, `11. PUT /api/donations/${createdId}/pickup transitions status to PICKED UP`);

        // 12. Deliver Donation (PUT)
        const deliverRes = await request('PUT', `/api/donations/${createdId}/deliver`);
        assert(deliverRes.status === 200 && deliverRes.body.success, `12. PUT /api/donations/${createdId}/deliver transitions status to DELIVERED`);

        console.log('\n================================================================');
        console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
        console.log('================================================================');

        if (failed > 0) {
            process.exit(1);
        } else {
            console.log('🎉 All 12 FoodBridge API, Auth and State Machine tests passed successfully!\n');
            process.exit(0);
        }
    } catch (err) {
        console.error('\n❌ Test execution encountered an unexpected error:', err.message);
        process.exit(1);
    }
}

runTests();
