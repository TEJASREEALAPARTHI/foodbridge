/**
 * FOODBRIDGE SINGLE SOURCE OF TRUTH API CLIENT
 * Simulates Teammate's Java REST Backend + MySQL Database
 * Enforces business rules, transactions, atomic status updates, and live stats aggregations.
 */

const STORAGE_KEY = "FOODBRIDGE_DB_V1";

// Helper to generate ISO strings relative to current time in minutes/hours
function getRelativeISO(offsetHours = 0, offsetMinutes = 0) {
    const d = new Date();
    d.setHours(d.getHours() + offsetHours);
    d.setMinutes(d.getMinutes() + offsetMinutes);
    return d.toISOString();
}

const DEFAULT_DB = {
    locations: [
        { location_id: 1, country: "India", state: "Andhra Pradesh", city: "Vijayawada", locality: "Gandhinagar", pincode: "520003" },
        { location_id: 2, country: "India", state: "Andhra Pradesh", city: "Vijayawada", locality: "Benz Circle", pincode: "520010" },
        { location_id: 3, country: "India", state: "Andhra Pradesh", city: "Guntur", locality: "Arundelpet", pincode: "522002" },
        { location_id: 4, country: "India", state: "Andhra Pradesh", city: "Visakhapatnam", locality: "Dwaraka Nagar", pincode: "530016" },
        { location_id: 5, country: "India", state: "Telangana", city: "Hyderabad", locality: "Madhapur", pincode: "500081" },
        { location_id: 6, country: "India", state: "Telangana", city: "Hyderabad", locality: "Gachibowli", pincode: "500032" },
        { location_id: 7, country: "India", state: "Karnataka", city: "Bengaluru", locality: "Indiranagar", pincode: "560038" },
        { location_id: 8, country: "India", state: "Tamil Nadu", city: "Chennai", locality: "T. Nagar", pincode: "600017" },
        { location_id: 9, country: "India", state: "Maharashtra", city: "Mumbai", locality: "Andheri West", pincode: "400058" }
    ],
    users: [
        { user_id: 1, name: "Sri Krishna Grand Admin", email: "donor.krishna@foodbridge.org", phone: "+91 98480 12345", role: "DONOR" },
        { user_id: 2, name: "VNR Hostel Canteen", email: "donor.vnr@foodbridge.org", phone: "+91 98480 67890", role: "DONOR" },
        { user_id: 3, name: "Royal Caterers Guntur", email: "donor.royal@foodbridge.org", phone: "+91 98480 54321", role: "DONOR" },
        { user_id: 4, name: "Seva Food Relief NGO", email: "ngo.seva@foodbridge.org", phone: "+91 94400 11223", role: "NGO" },
        { user_id: 5, name: "Annamrita Foundation", email: "ngo.annamrita@foodbridge.org", phone: "+91 94400 44556", role: "NGO" },
        { user_id: 6, name: "Hope Shelter Community", email: "ngo.hope@foodbridge.org", phone: "+91 94400 77889", role: "NGO" },
        { user_id: 7, name: "System Administrator", email: "admin@foodbridge.org", phone: "+91 99999 00000", role: "ADMIN" }
    ],
    donors: [
        { donor_id: 1, user_id: 1, organization_name: "Sri Krishna Grand Restaurant", donor_type: "RESTAURANT", location_id: 1, address_line: "Opposite Sub-Collector Office, Gandhinagar", contact_person: "Ramesh Kumar", phone: "+91 98480 12345" },
        { donor_id: 2, user_id: 2, organization_name: "VNR College Hostel Mess", donor_type: "HOSTEL", location_id: 2, address_line: "Near Benz Circle, Ring Road", contact_person: "P. Srinivas", phone: "+91 98480 67890" },
        { donor_id: 3, user_id: 3, organization_name: "Royal Event Caterers", donor_type: "EVENT", location_id: 3, address_line: "1st Line, Arundelpet, Guntur", contact_person: "K. Venkatesh", phone: "+91 98480 54321" }
    ],
    ngos: [
        { ngo_id: 1, user_id: 4, organization_name: "Seva Food Relief Foundation", registration_number: "NGO-AP-VIJ-2018-092", location_id: 1, address_line: "Bunder Road, Gandhinagar, Vijayawada", contact_person: "Smt. Lakshmi Devi", phone: "+91 94400 11223", capacity_servings: 200 },
        { ngo_id: 2, user_id: 5, organization_name: "Annamrita Community Kitchen", registration_number: "NGO-AP-VIJ-2020-144", location_id: 2, address_line: "MG Road, Vijayawada", contact_person: "Rajesh Sharma", phone: "+91 94400 44556", capacity_servings: 350 },
        { ngo_id: 3, user_id: 6, organization_name: "Hope Child & Elderly Shelter", registration_number: "NGO-AP-GUN-2019-078", location_id: 3, address_line: "Main Road, Arundelpet, Guntur", contact_person: "Mary Joseph", phone: "+91 94400 77889", capacity_servings: 120 }
    ],
    food_categories: [
        { category_id: 1, category_name: "Cooked Food" },
        { category_id: 2, category_name: "Packaged Food" },
        { category_id: 3, category_name: "Fruits & Vegetables" },
        { category_id: 4, category_name: "Bakery & Confectionery" },
        { category_id: 5, category_name: "Beverages & Dairy" },
        { category_id: 6, category_name: "Other Surplus" }
    ],
    donations: [
        {
            donation_id: 101,
            donor_id: 1,
            ngo_id: null,
            food_name: "Vegetable Pulao & Mix Dal",
            dietary_type: "VEGETARIAN",
            category_id: 1,
            cuisine: "INDIAN",
            quantity: 35,
            unit: "PORTIONS",
            prepared_at: getRelativeISO(-2, 0),
            best_before: getRelativeISO(1, 30), // Urgent (~1.5 hrs remaining)
            storage_condition: "HEATED",
            description: "Freshly prepared aromatic basmati pulao with yellow tadka dal from lunch buffet. Kept in warm insulated containers.",
            location_id: 1,
            status: "AVAILABLE",
            created_at: getRelativeISO(-2, 0),
            updated_at: getRelativeISO(-2, 0)
        },
        {
            donation_id: 102,
            donor_id: 1,
            ngo_id: null,
            food_name: "Hyderabadi Veg Biryani & Salan",
            dietary_type: "VEGETARIAN",
            category_id: 1,
            cuisine: "INDIAN",
            quantity: 25,
            unit: "PORTIONS",
            prepared_at: getRelativeISO(-1, 0),
            best_before: getRelativeISO(4, 0), // Moderate (~4 hrs remaining)
            storage_condition: "HEATED",
            description: "Surplus high quality vegetable dum biryani with mirchi ka salan and raita pouches.",
            location_id: 2,
            status: "AVAILABLE",
            created_at: getRelativeISO(-1, 0),
            updated_at: getRelativeISO(-1, 0)
        },
        {
            donation_id: 103,
            donor_id: 3,
            ngo_id: null,
            food_name: "Sealed Wheat Bread Loaves & Jam",
            dietary_type: "VEGETARIAN",
            category_id: 4,
            cuisine: "OTHER",
            quantity: 20,
            unit: "PACKETS",
            prepared_at: getRelativeISO(-6, 0),
            best_before: getRelativeISO(48, 0), // Normal (~2 days remaining)
            storage_condition: "ROOM_TEMPERATURE",
            description: "Unopened whole wheat sandwich bread loaves from catering breakfast counter.",
            location_id: 3,
            status: "AVAILABLE",
            created_at: getRelativeISO(-6, 0),
            updated_at: getRelativeISO(-6, 0)
        },
        {
            donation_id: 104,
            donor_id: 1,
            ngo_id: 1,
            food_name: "South Indian Meals (Sambar, Rice, Poriyal)",
            dietary_type: "VEGETARIAN",
            category_id: 1,
            cuisine: "INDIAN",
            quantity: 40,
            unit: "PORTIONS",
            prepared_at: getRelativeISO(-3, 0),
            best_before: getRelativeISO(2, 30),
            storage_condition: "ROOM_TEMPERATURE",
            description: "Steamed sona masoori rice with drumstick sambar and cabbage poriyal.",
            location_id: 1,
            status: "ACCEPTED",
            created_at: getRelativeISO(-3, 0),
            updated_at: getRelativeISO(-1, 30)
        },
        {
            donation_id: 105,
            donor_id: 2,
            ngo_id: 1,
            food_name: "Chapati & Mixed Vegetable Curry",
            dietary_type: "VEGAN",
            category_id: 1,
            cuisine: "INDIAN",
            quantity: 50,
            unit: "PORTIONS",
            prepared_at: getRelativeISO(-4, 0),
            best_before: getRelativeISO(3, 0),
            storage_condition: "ROOM_TEMPERATURE",
            description: "Soft whole wheat chapatis with rich vegetable curry from evening student mess.",
            location_id: 2,
            status: "PICKUP_SCHEDULED",
            created_at: getRelativeISO(-4, 0),
            updated_at: getRelativeISO(-2, 0)
        },
        {
            donation_id: 106,
            donor_id: 1,
            ngo_id: 1,
            food_name: "Paneer Butter Masala & Jeera Rice",
            dietary_type: "VEGETARIAN",
            category_id: 1,
            cuisine: "INDIAN",
            quantity: 30,
            unit: "PORTIONS",
            prepared_at: getRelativeISO(-28, 0),
            best_before: getRelativeISO(-20, 0),
            storage_condition: "REFRIGERATED",
            description: "Dinner banquet surplus successfully collected and distributed to street shelter.",
            location_id: 1,
            status: "COMPLETED",
            created_at: getRelativeISO(-28, 0),
            updated_at: getRelativeISO(-22, 0)
        },
        {
            donation_id: 107,
            donor_id: 3,
            ngo_id: null,
            food_name: "Cut Fruit Salad Bowls",
            dietary_type: "VEGAN",
            category_id: 3,
            cuisine: "OTHER",
            quantity: 15,
            unit: "BOXES",
            prepared_at: getRelativeISO(-8, 0),
            best_before: getRelativeISO(-2, 0), // Expired 2 hrs ago
            storage_condition: "REFRIGERATED",
            description: "Assorted seasonal watermelon and papaya fruit bowls.",
            location_id: 3,
            status: "EXPIRED",
            created_at: getRelativeISO(-8, 0),
            updated_at: getRelativeISO(-2, 0)
        }
    ],
    pickup_requests: [
        {
            pickup_id: 201,
            donation_id: 105,
            ngo_id: 1,
            pickup_date: new Date().toISOString().split('T')[0],
            pickup_time: "19:30",
            contact_person: "Volunteer R. Kumar",
            contact_phone: "+91 94400 11223",
            vehicle_type: "Maruti Eeco Van (Insulated)",
            notes: "Donor confirmed gate 2 entrance for pickup",
            status: "SCHEDULED",
            created_at: getRelativeISO(-2, 0),
            updated_at: getRelativeISO(-2, 0)
        },
        {
            pickup_id: 202,
            donation_id: 106,
            ngo_id: 1,
            pickup_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            pickup_time: "21:00",
            contact_person: "Volunteer S. Rao",
            contact_phone: "+91 94400 11223",
            vehicle_type: "Three-Wheeler Auto",
            notes: "Smooth collection, food quality verified",
            status: "COLLECTED",
            created_at: getRelativeISO(-24, 0),
            updated_at: getRelativeISO(-22, 0)
        }
    ],
    notifications: [
        {
            notification_id: 1,
            user_id: 1,
            title: "Donation Accepted!",
            message: "Seva Food Relief Foundation accepted your donation: South Indian Meals (40 portions).",
            type: "SUCCESS",
            is_read: false,
            created_at: getRelativeISO(-1, 30)
        },
        {
            notification_id: 2,
            user_id: 1,
            title: "Pickup Scheduled",
            message: "Pickup for Chapati & Veg Curry scheduled by Seva Food Relief for today at 7:30 PM.",
            type: "INFO",
            is_read: true,
            created_at: getRelativeISO(-2, 0)
        },
        {
            notification_id: 3,
            user_id: 4,
            title: "Urgent Food Available",
            message: "Sri Krishna Grand listed Vegetable Pulao (35 portions) expiring in less than 2 hours.",
            type: "WARNING",
            is_read: false,
            created_at: getRelativeISO(-1, 55)
        }
    ]
};

const ApiService = {
    // Read from DB
    _getDB() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            this._saveDB(DEFAULT_DB);
            return JSON.parse(JSON.stringify(DEFAULT_DB));
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error("Database parse error, resetting to seed defaults.", e);
            this._saveDB(DEFAULT_DB);
            return JSON.parse(JSON.stringify(DEFAULT_DB));
        }
    },

    // Save to DB
    _saveDB(db) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    },

    // Simulate async network delay (100ms) for realism
    async _delay(ms = 100) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Hydrates a donation with donor, location, and category data (Simulates SQL JOIN)
    _hydrateDonation(donation, db) {
        const donor = db.donors.find(d => d.donor_id === donation.donor_id) || {};
        const location = db.locations.find(l => l.location_id === donation.location_id) || {};
        const category = db.food_categories.find(c => c.category_id === donation.category_id) || {};
        const ngo = donation.ngo_id ? db.ngos.find(n => n.ngo_id === donation.ngo_id) : null;
        const pickup = db.pickup_requests.find(p => p.donation_id === donation.donation_id) || null;

        return {
            ...donation,
            donor_name: donor.organization_name || "Unknown Donor",
            donor_type: donor.donor_type || "OTHER",
            donor_phone: donor.phone || "",
            donor_address: donor.address_line || "",
            category_name: category.category_name || "General",
            state: location.state || "",
            city: location.city || "",
            locality: location.locality || "",
            claiming_ngo_name: ngo ? ngo.organization_name : null,
            claiming_ngo_phone: ngo ? ngo.phone : null,
            pickup_details: pickup
        };
    },

    // Periodic sweep: Auto-update expired items (Simulates Scheduled Database Job)
    _auditExpiryStatus(db) {
        const now = Date.now();
        let changed = false;
        db.donations.forEach(d => {
            if (d.status === 'AVAILABLE' && new Date(d.best_before).getTime() <= now) {
                d.status = 'EXPIRED';
                d.updated_at = new Date().toISOString();
                changed = true;
            }
        });
        if (changed) {
            this._saveDB(db);
        }
    },

    // ==========================================================
    // API ENDPOINTS
    // ==========================================================

    /**
     * GET /api/donations
     * Filters available donations from the database.
     */
    async getDonations(filters = {}) {
        await this._delay();
        const db = this._getDB();
        this._auditExpiryStatus(db);

        let results = db.donations.map(d => this._hydrateDonation(d, db));

        // Filter by Status (e.g. 'AVAILABLE', 'ACCEPTED', 'COMPLETED')
        if (filters.status) {
            results = results.filter(d => d.status === filters.status);
        }

        // Filter by Donor ID
        if (filters.donor_id) {
            results = results.filter(d => d.donor_id === parseInt(filters.donor_id));
        }

        // Filter by NGO ID
        if (filters.ngo_id) {
            results = results.filter(d => d.ngo_id === parseInt(filters.ngo_id));
        }

        // Filter by State
        if (filters.state) {
            results = results.filter(d => d.state.toLowerCase() === filters.state.toLowerCase());
        }

        // Filter by City
        if (filters.city) {
            results = results.filter(d => d.city.toLowerCase() === filters.city.toLowerCase());
        }

        // Filter by Locality
        if (filters.locality) {
            results = results.filter(d => d.locality.toLowerCase() === filters.locality.toLowerCase());
        }

        // Filter by Dietary Type
        if (filters.dietary_type) {
            results = results.filter(d => d.dietary_type === filters.dietary_type);
        }

        // Filter by Category
        if (filters.category_id) {
            results = results.filter(d => d.category_id === parseInt(filters.category_id));
        }

        // Search text in food name or description
        if (filters.search) {
            const q = filters.search.toLowerCase().trim();
            results = results.filter(d => 
                d.food_name.toLowerCase().includes(q) || 
                d.description.toLowerCase().includes(q) ||
                d.donor_name.toLowerCase().includes(q)
            );
        }

        // Sort by Urgency (soonest expiring first)
        if (filters.sortByUrgency !== false) {
            results.sort((a, b) => new Date(a.best_before).getTime() - new Date(b.best_before).getTime());
        }

        return results;
    },

    /**
     * GET /api/donations/:id
     */
    async getDonationById(id) {
        await this._delay();
        const db = this._getDB();
        this._auditExpiryStatus(db);
        const donation = db.donations.find(d => d.donation_id === parseInt(id));
        if (!donation) throw new Error("Donation not found");
        return this._hydrateDonation(donation, db);
    },

    /**
     * POST /api/donations
     * Validates form and inserts new donation record into MySQL
     */
    async createDonation(payload) {
        await this._delay(150);
        const db = this._getDB();

        // 1. Validation
        if (!payload.food_name || !payload.food_name.trim()) {
            throw new Error("Food title is required.");
        }
        if (!payload.quantity || parseInt(payload.quantity) <= 0) {
            throw new Error("Quantity must be a positive number.");
        }
        if (!payload.best_before) {
            throw new Error("Best-before expiration time is required.");
        }
        if (new Date(payload.best_before).getTime() <= Date.now()) {
            throw new Error("Best-before time must be in the future.");
        }
        if (!payload.state || !payload.city || !payload.locality) {
            throw new Error("Complete location details (State, City, Locality) are required.");
        }

        // 2. Find or Create Normalized Location
        let location = db.locations.find(l => 
            l.state.toLowerCase() === payload.state.toLowerCase() &&
            l.city.toLowerCase() === payload.city.toLowerCase() &&
            l.locality.toLowerCase() === payload.locality.toLowerCase()
        );

        if (!location) {
            const nextLocId = db.locations.length ? Math.max(...db.locations.map(l => l.location_id)) + 1 : 1;
            location = {
                location_id: nextLocId,
                country: "India",
                state: payload.state,
                city: payload.city,
                locality: payload.locality,
                pincode: payload.pincode || ""
            };
            db.locations.push(location);
        }

        // 3. Create Donation Record
        const nextId = db.donations.length ? Math.max(...db.donations.map(d => d.donation_id)) + 1 : 101;
        const nowISO = new Date().toISOString();

        const newDonation = {
            donation_id: nextId,
            donor_id: parseInt(payload.donor_id) || 1,
            ngo_id: null,
            food_name: payload.food_name.trim(),
            dietary_type: payload.dietary_type || "VEGETARIAN",
            category_id: parseInt(payload.category_id) || 1,
            cuisine: payload.cuisine || "INDIAN",
            quantity: parseInt(payload.quantity),
            unit: payload.unit || "PORTIONS",
            prepared_at: payload.prepared_at || nowISO,
            best_before: new Date(payload.best_before).toISOString(),
            storage_condition: payload.storage_condition || "ROOM_TEMPERATURE",
            description: (payload.description || "").trim(),
            location_id: location.location_id,
            status: "AVAILABLE",
            created_at: nowISO,
            updated_at: nowISO
        };

        db.donations.unshift(newDonation);

        // 4. Add system notification
        const nextNotifId = db.notifications.length ? Math.max(...db.notifications.map(n => n.notification_id)) + 1 : 1;
        db.notifications.unshift({
            notification_id: nextNotifId,
            user_id: 1, // Donor user
            title: "Donation Registered",
            message: `Successfully listed "${newDonation.food_name}" (${newDonation.quantity} ${newDonation.unit.toLowerCase()}).`,
            type: "SUCCESS",
            is_read: false,
            created_at: nowISO
        });

        this._saveDB(db);
        return { success: true, donation_id: newDonation.donation_id, message: "Donation registered successfully." };
    },

    /**
     * POST /api/donations/:id/accept
     * ATOMIC DONATION ACCEPTANCE WITH CONCURRENCY GUARD
     */
    async acceptDonation(donationId, ngoId = 1) {
        await this._delay(200);
        const db = this._getDB();
        const donation = db.donations.find(d => d.donation_id === parseInt(donationId));

        if (!donation) {
            return { success: false, message: "Donation record does not exist." };
        }

        // Concurrency Guard: Check if status is still AVAILABLE
        if (donation.status !== "AVAILABLE") {
            return {
                success: false,
                message: `This donation is no longer available (Current Status: ${donation.status}).`
            };
        }

        // Expiry Guard
        if (new Date(donation.best_before).getTime() <= Date.now()) {
            donation.status = "EXPIRED";
            donation.updated_at = new Date().toISOString();
            this._saveDB(db);
            return {
                success: false,
                message: "This donation has expired and can no longer be accepted."
            };
        }

        // Perform Transition: AVAILABLE -> ACCEPTED
        const nowISO = new Date().toISOString();
        donation.status = "ACCEPTED";
        donation.ngo_id = parseInt(ngoId);
        donation.updated_at = nowISO;

        const ngo = db.ngos.find(n => n.ngo_id === parseInt(ngoId)) || { organization_name: "NGO Partner" };

        // Add Notification for Donor
        const nextNotifId = db.notifications.length ? Math.max(...db.notifications.map(n => n.notification_id)) + 1 : 1;
        db.notifications.unshift({
            notification_id: nextNotifId,
            user_id: donation.donor_id,
            title: "Donation Accepted!",
            message: `${ngo.organization_name} has accepted your donation "${donation.food_name}".`,
            type: "SUCCESS",
            is_read: false,
            created_at: nowISO
        });

        this._saveDB(db);
        return { success: true, message: `Donation #${donation.donation_id} accepted successfully!` };
    },

    /**
     * POST /api/pickups
     * Schedules a pickup for an ACCEPTED donation
     */
    async schedulePickup(payload) {
        await this._delay(150);
        const db = this._getDB();
        const donation = db.donations.find(d => d.donation_id === parseInt(payload.donation_id));

        if (!donation) throw new Error("Donation not found.");
        if (donation.status !== "ACCEPTED") {
            throw new Error(`Cannot schedule pickup for donation in state ${donation.status}. Must be ACCEPTED.`);
        }

        const nextPickupId = db.pickup_requests.length ? Math.max(...db.pickup_requests.map(p => p.pickup_id)) + 1 : 201;
        const nowISO = new Date().toISOString();

        const newPickup = {
            pickup_id: nextPickupId,
            donation_id: donation.donation_id,
            ngo_id: parseInt(payload.ngo_id) || donation.ngo_id || 1,
            pickup_date: payload.pickup_date,
            pickup_time: payload.pickup_time,
            contact_person: payload.contact_person || "Volunteer",
            contact_phone: payload.contact_phone || "+91 94400 11223",
            vehicle_type: payload.vehicle_type || "Four-Wheeler Van",
            notes: (payload.notes || "").trim(),
            status: "SCHEDULED",
            created_at: nowISO,
            updated_at: nowISO
        };

        db.pickup_requests.push(newPickup);

        // Update Donation Status: ACCEPTED -> PICKUP_SCHEDULED
        donation.status = "PICKUP_SCHEDULED";
        donation.updated_at = nowISO;

        this._saveDB(db);
        return { success: true, pickup_id: newPickup.pickup_id, message: "Pickup scheduled successfully." };
    },

    /**
     * POST /api/pickups/:id/complete
     * Marks pickup collected and donation COMPLETED
     */
    async completePickup(pickupId, donationId) {
        await this._delay(150);
        const db = this._getDB();
        const pickup = db.pickup_requests.find(p => p.pickup_id === parseInt(pickupId));
        const donation = db.donations.find(d => d.donation_id === parseInt(donationId));

        if (!donation) throw new Error("Donation not found.");

        const nowISO = new Date().toISOString();
        if (pickup) {
            pickup.status = "COLLECTED";
            pickup.updated_at = nowISO;
        }

        donation.status = "COMPLETED";
        donation.updated_at = nowISO;

        // Add Notification
        const nextNotifId = db.notifications.length ? Math.max(...db.notifications.map(n => n.notification_id)) + 1 : 1;
        db.notifications.unshift({
            notification_id: nextNotifId,
            user_id: donation.donor_id,
            title: "Rescue Completed! 🎉",
            message: `Food collection for "${donation.food_name}" is complete. Thank you for making an impact!`,
            type: "SUCCESS",
            is_read: false,
            created_at: nowISO
        });

        this._saveDB(db);
        return { success: true, message: "Food rescue successfully marked as completed!" };
    },

    /**
     * POST /api/donations/:id/cancel
     */
    async cancelDonation(donationId) {
        await this._delay(150);
        const db = this._getDB();
        const donation = db.donations.find(d => d.donation_id === parseInt(donationId));

        if (!donation) throw new Error("Donation not found.");
        if (donation.status === "COMPLETED") throw new Error("Cannot cancel a completed donation.");

        donation.status = "CANCELLED";
        donation.updated_at = new Date().toISOString();

        this._saveDB(db);
        return { success: true, message: "Donation has been cancelled." };
    },

    /**
     * GET /api/donors/:id/stats
     * Computes live SQL aggregated counts for Donor Dashboard
     */
    async getDonorStats(donorId = 1) {
        await this._delay();
        const db = this._getDB();
        this._auditExpiryStatus(db);

        const donorDonations = db.donations.filter(d => d.donor_id === parseInt(donorId));

        const active = donorDonations.filter(d => d.status === "AVAILABLE").length;
        const accepted = donorDonations.filter(d => d.status === "ACCEPTED").length;
        const scheduled = donorDonations.filter(d => d.status === "PICKUP_SCHEDULED").length;
        const completed = donorDonations.filter(d => d.status === "COMPLETED").length;
        const expired = donorDonations.filter(d => d.status === "EXPIRED").length;
        const totalServings = donorDonations
            .filter(d => d.status === "COMPLETED")
            .reduce((sum, d) => sum + (d.quantity || 0), 0);

        return {
            active_donations: active,
            accepted_donations: accepted,
            pickup_scheduled: scheduled,
            completed_donations: completed,
            expired_donations: expired,
            total_servings_donated: totalServings
        };
    },

    /**
     * GET /api/ngos/:id/stats
     * Computes live SQL aggregated counts for NGO Dashboard
     */
    async getNgoStats(ngoId = 1) {
        await this._delay();
        const db = this._getDB();
        this._auditExpiryStatus(db);

        const availableInPlatform = db.donations.filter(d => d.status === "AVAILABLE").length;
        const ngoDonations = db.donations.filter(d => d.ngo_id === parseInt(ngoId));

        const pendingPickup = ngoDonations.filter(d => d.status === "ACCEPTED").length;
        const scheduledPickups = ngoDonations.filter(d => d.status === "PICKUP_SCHEDULED").length;
        const completedRescues = ngoDonations.filter(d => d.status === "COMPLETED").length;
        const mealsRescued = ngoDonations
            .filter(d => d.status === "COMPLETED")
            .reduce((sum, d) => sum + (d.quantity || 0), 0);

        return {
            available_in_platform: availableInPlatform,
            pending_pickup: pendingPickup,
            scheduled_pickups: scheduledPickups,
            completed_rescues: completedRescues,
            meals_rescued: mealsRescued
        };
    },

    /**
     * GET /api/admin/stats
     */
    async getAdminStats() {
        await this._delay();
        const db = this._getDB();
        this._auditExpiryStatus(db);

        return {
            total_donors: db.donors.length,
            total_ngos: db.ngos.length,
            total_donations: db.donations.length,
            available_donations: db.donations.filter(d => d.status === "AVAILABLE").length,
            completed_rescues: db.donations.filter(d => d.status === "COMPLETED").length,
            total_meals_distributed: db.donations
                .filter(d => d.status === "COMPLETED")
                .reduce((sum, d) => sum + (d.quantity || 0), 0)
        };
    },

    /**
     * GET /api/notifications
     */
    async getNotifications(userId = 1) {
        await this._delay();
        const db = this._getDB();
        return db.notifications.filter(n => n.user_id === parseInt(userId));
    },

    /**
     * POST /api/database/reset
     * Resets demo database to initial state
     */
    async resetDatabase() {
        await this._delay(150);
        this._saveDB(DEFAULT_DB);
        return { success: true, message: "Database reset to original seed state." };
    }
};

window.ApiService = ApiService;
