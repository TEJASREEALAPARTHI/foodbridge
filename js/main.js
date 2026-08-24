// ================================================================
// public/js/main.js - Core Client Application Logic for FoodBridge
// Dual-Mode: Communicates with Node/Express REST API when online,
// and provides instant client-side fallback when hosted on GitHub Pages!
// ================================================================

// Default sample dataset for instant out-of-the-box live preview
const DEFAULT_SAMPLE_DONATIONS = [
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

// Global Application State
const AppState = {
    donations: [],
    selectedState: 'Andhra Pradesh', // Default active state for NGO search
    activeView: 'landing',            // 'landing', 'donor', 'ngo'
    activeNgoTab: 'available',        // 'available', 'accepted', 'history'
    currentUser: null,                // Logged-in user object { id, name, email, role, state }
    donorFilterStatus: 'ALL',
    donorFilterCategory: 'ALL',
    ngoFilterType: 'ALL',
    ngoFilterFreshness: 'ALL'
};

const API_BASE_URL = '/api';

// ================================================================
// 1. INITIALIZATION ON PAGE LOAD
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadUserSession();
    initNavigation();
    initAuthHandlers();
    initForms();
    initFilters();
    loadDashboardData();
    setDefaultDateTime();
});

// Load persistent user session from localStorage
function loadUserSession() {
    try {
        const saved = localStorage.getItem('foodbridge_user');
        if (saved) {
            AppState.currentUser = JSON.parse(saved);
            if (AppState.currentUser.state) {
                AppState.selectedState = AppState.currentUser.state;
            }
        }
    } catch (e) {
        AppState.currentUser = null;
    }
    updateAuthUI();
}

function saveUserSession(user) {
    AppState.currentUser = user;
    localStorage.setItem('foodbridge_user', JSON.stringify(user));
    if (user && user.state) {
        AppState.selectedState = user.state;
        const stateSelect = document.getElementById('ngo-state-select');
        if (stateSelect) stateSelect.value = user.state;
        const stateDisplay = document.getElementById('ngo-selected-state-display');
        if (stateDisplay) stateDisplay.textContent = user.state.toUpperCase();
    }
    updateAuthUI();
}

function updateAuthUI() {
    const guestGroup = document.getElementById('nav-guest-group');
    const userProfile = document.getElementById('nav-user-profile');
    const userNameEl = document.getElementById('nav-user-name');
    const userRoleEl = document.getElementById('nav-user-role');
    const userAvatarEl = document.getElementById('nav-user-avatar');

    if (AppState.currentUser) {
        if (guestGroup) guestGroup.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        if (userNameEl) userNameEl.textContent = AppState.currentUser.name;
        if (userRoleEl) userRoleEl.textContent = AppState.currentUser.role === 'DONOR' ? '🏢 Donor' : '🤝 NGO';
        if (userAvatarEl) userAvatarEl.textContent = AppState.currentUser.name.charAt(0).toUpperCase();
    } else {
        if (guestGroup) guestGroup.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
    }
}

function setDefaultDateTime() {
    const now = new Date();
    const prepInput = document.getElementById('input-prepared-time');
    const expInput = document.getElementById('input-expiry-time');

    const formatDateTime = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };

    if (prepInput) prepInput.value = formatDateTime(now);
    if (expInput) {
        const defaultExpiry = new Date(now.getTime() + 8 * 3600 * 1000);
        expInput.value = formatDateTime(defaultExpiry);
    }
}

function quickStateSelect(stateName) {
    AppState.selectedState = stateName;
    const stateSelect = document.getElementById('ngo-state-select');
    if (stateSelect) stateSelect.value = stateName;
    const stateDisplay = document.getElementById('ngo-selected-state-display');
    if (stateDisplay) stateDisplay.textContent = stateName.toUpperCase();
    switchView('ngo');
}
window.quickStateSelect = quickStateSelect;

// ================================================================
// 2. AUTHENTICATION HANDLERS (LOGIN / SIGNUP)
// ================================================================
function initAuthHandlers() {
    const authModal = document.getElementById('auth-modal');
    const openLoginBtn = document.getElementById('btn-open-login');
    const openSignupBtn = document.getElementById('btn-open-signup');
    const closeModalBtn = document.getElementById('btn-close-auth');
    const logoutBtn = document.getElementById('btn-logout');

    if (openLoginBtn) openLoginBtn.addEventListener('click', () => openAuthModal('login'));
    if (openSignupBtn) openSignupBtn.addEventListener('click', () => openAuthModal('signup'));
    if (closeModalBtn && authModal) closeModalBtn.addEventListener('click', () => authModal.classList.remove('show'));
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) authModal.classList.remove('show');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('foodbridge_user');
            AppState.currentUser = null;
            updateAuthUI();
            showToast('👋 You have been logged out.', 'info');
            switchView('landing');
        });
    }

    const tabLoginBtn = document.getElementById('auth-tab-login');
    const tabSignupBtn = document.getElementById('auth-tab-signup');
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');

    if (tabLoginBtn && tabSignupBtn) {
        tabLoginBtn.addEventListener('click', () => {
            tabLoginBtn.classList.add('active');
            tabSignupBtn.classList.remove('active');
            formLogin.style.display = 'block';
            formSignup.style.display = 'none';
        });

        tabSignupBtn.addEventListener('click', () => {
            tabSignupBtn.classList.add('active');
            tabLoginBtn.classList.remove('active');
            formLogin.style.display = 'none';
            formSignup.style.display = 'block';
        });
    }

    // Login Form Submit
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            try {
                const res = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                if (res.ok) {
                    const result = await res.json();
                    if (result.success) {
                        saveUserSession(result.user);
                        authModal.classList.remove('show');
                        showToast(`✨ Welcome back, ${result.user.name}!`, 'success');
                        if (result.user.role === 'DONOR') switchView('donor');
                        else switchView('ngo');
                        return;
                    }
                }
            } catch (err) {
                // Fallback for static GitHub Pages demo
            }

            // Client-side demo fallback authentication
            let fallbackUser = null;
            if (email.includes('donor') || email.includes('restaurant')) {
                fallbackUser = { id: 1, name: 'Annapurna Grand Restaurant', email, role: 'DONOR', state: 'Andhra Pradesh' };
            } else {
                fallbackUser = { id: 7, name: 'Seva Food Rescue Foundation', email, role: 'NGO', state: 'Andhra Pradesh' };
            }
            saveUserSession(fallbackUser);
            authModal.classList.remove('show');
            showToast(`✨ Welcome back, ${fallbackUser.name}!`, 'success');
            if (fallbackUser.role === 'DONOR') switchView('donor');
            else switchView('ngo');
        });
    }

    // Signup Form Submit
    if (formSignup) {
        formSignup.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value.trim();
            const role = document.getElementById('signup-role').value;
            const state = document.getElementById('signup-state').value;
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;

            if (!name || !role || !state || !email || !password) {
                showToast('Please fill in all registration fields', 'error');
                return;
            }

            const newUser = { id: Date.now(), name, role, state, email };

            try {
                const res = await fetch(`${API_BASE_URL}/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, role, state, email, password })
                });
                if (res.ok) {
                    const result = await res.json();
                    if (result.success) {
                        saveUserSession(result.user);
                        authModal.classList.remove('show');
                        showToast(`🎉 Registration successful! Welcome, ${result.user.name}.`, 'success');
                        if (result.user.role === 'DONOR') switchView('donor');
                        else switchView('ngo');
                        return;
                    }
                }
            } catch (err) {
                // Fallback for static hosting
            }

            saveUserSession(newUser);
            authModal.classList.remove('show');
            showToast(`🎉 Registration successful! Welcome, ${newUser.name}.`, 'success');
            if (newUser.role === 'DONOR') switchView('donor');
            else switchView('ngo');
        });
    }
}

function openAuthModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.add('show');

    const tabLoginBtn = document.getElementById('auth-tab-login');
    const tabSignupBtn = document.getElementById('auth-tab-signup');
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');

    if (tab === 'login') {
        if (tabLoginBtn) tabLoginBtn.classList.add('active');
        if (tabSignupBtn) tabSignupBtn.classList.remove('active');
        if (formLogin) formLogin.style.display = 'block';
        if (formSignup) formSignup.style.display = 'none';
    } else {
        if (tabSignupBtn) tabSignupBtn.classList.add('active');
        if (tabLoginBtn) tabLoginBtn.classList.remove('active');
        if (formLogin) formLogin.style.display = 'none';
        if (formSignup) formSignup.style.display = 'block';
    }
}
window.openAuthModal = openAuthModal;

function quickLogin(role) {
    if (role === 'DONOR') {
        document.getElementById('login-email').value = 'donor@annapurna.in';
        document.getElementById('login-password').value = 'password123';
    } else if (role === 'NGO') {
        document.getElementById('login-email').value = 'ngo@seva.org';
        document.getElementById('login-password').value = 'password123';
    }
    const formLogin = document.getElementById('form-login');
    if (formLogin) formLogin.requestSubmit();
}
window.quickLogin = quickLogin;

// ================================================================
// 3. NAVIGATION & VIEW SWITCHING
// ================================================================
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.getAttribute('data-view');
            switchView(targetView);
        });
    });

    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.activeNgoTab = btn.getAttribute('data-tab');
            renderNgoPortal();
        });
    });
}

function switchView(viewName) {
    AppState.activeView = viewName;

    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('data-view') === viewName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.getElementById('view-landing').style.display = 'none';
    document.getElementById('view-donor').style.display = 'none';
    document.getElementById('view-ngo').style.display = 'none';

    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
        targetSection.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (viewName === 'donor') {
        renderDonorPortal();
    } else if (viewName === 'ngo') {
        renderNgoPortal();
    }
}
window.switchView = switchView;

// ================================================================
// 4. API & DATA MANAGEMENT (DUAL-MODE REST + LOCAL REACTIVE)
// ================================================================
async function loadDashboardData() {
    try {
        const res = await fetch(`${API_BASE_URL}/donations`);
        if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                AppState.donations = json.data;
                saveLocalDonations(AppState.donations);
                updateSummaryCounters();
                renderDonorPortal();
                renderNgoPortal();
                return;
            }
        }
    } catch (error) {
        // Fallback for static hosting / GitHub Pages
    }

    // Load from local storage or pre-loaded initial dataset
    const cached = getLocalDonations();
    AppState.donations = cached && cached.length > 0 ? cached : DEFAULT_SAMPLE_DONATIONS;
    updateSummaryCounters();
    renderDonorPortal();
    renderNgoPortal();
}

function getLocalDonations() {
    try {
        const data = localStorage.getItem('foodbridge_donations');
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

function saveLocalDonations(donations) {
    try {
        localStorage.setItem('foodbridge_donations', JSON.stringify(donations));
    } catch (e) {}
}

function updateSummaryCounters() {
    const total = AppState.donations.length;
    const available = AppState.donations.filter(d => d.status === 'AVAILABLE').length;
    const accepted = AppState.donations.filter(d => d.status === 'ACCEPTED').length;
    const pickedUp = AppState.donations.filter(d => d.status === 'PICKED UP').length;
    const delivered = AppState.donations.filter(d => d.status === 'DELIVERED').length;

    const donorTotalEl = document.getElementById('donor-stat-total');
    const donorAvailEl = document.getElementById('donor-stat-available');
    const donorPickedEl = document.getElementById('donor-stat-picked');
    const donorDeliveredEl = document.getElementById('donor-stat-delivered');

    if (donorTotalEl) donorTotalEl.textContent = total;
    if (donorAvailEl) donorAvailEl.textContent = available;
    if (donorPickedEl) donorPickedEl.textContent = pickedUp;
    if (donorDeliveredEl) donorDeliveredEl.textContent = delivered;

    const ngoAvailEl = document.getElementById('ngo-stat-available');
    const ngoAcceptedEl = document.getElementById('ngo-stat-accepted');
    const ngoPickedEl = document.getElementById('ngo-stat-picked');
    const ngoDeliveredEl = document.getElementById('ngo-stat-delivered');

    if (ngoAvailEl) ngoAvailEl.textContent = available;
    if (ngoAcceptedEl) ngoAcceptedEl.textContent = accepted;
    if (ngoPickedEl) ngoPickedEl.textContent = pickedUp;
    if (ngoDeliveredEl) ngoDeliveredEl.textContent = delivered;
}

// ================================================================
// 5. DONATION FORM & SUBMISSION
// ================================================================
function initForms() {
    const donationForm = document.getElementById('form-add-donation');
    if (!donationForm) return;

    donationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            food_name: document.getElementById('input-food-name').value.trim(),
            food_type: document.getElementById('input-food-type').value,
            category: document.getElementById('input-category').value,
            quantity: parseFloat(document.getElementById('input-quantity').value),
            unit: document.getElementById('input-unit').value,
            prepared_time: document.getElementById('input-prepared-time').value,
            expiry_time: document.getElementById('input-expiry-time').value,
            state: document.getElementById('input-state').value,
            pickup_location: document.getElementById('input-pickup-location').value.trim(),
            description: document.getElementById('input-description').value.trim(),
            donor_id: AppState.currentUser ? AppState.currentUser.id : 1
        };

        const isValid = window.DonationValidator.validateDonationForm(formData);
        if (!isValid) {
            showToast('Please correct the highlighted fields in the form', 'error');
            return;
        }

        const submitBtn = document.getElementById('btn-submit-donation');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Listing Donation...';

        try {
            const response = await fetch(`${API_BASE_URL}/donations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    showToast('🎉 Surplus food listed successfully for NGO pickup!', 'success');
                    donationForm.reset();
                    window.DonationValidator.resetAllErrors(donationForm);
                    setDefaultDateTime();
                    await loadDashboardData();
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'List Donation';
                    return;
                }
            }
        } catch (error) {
            // Client-side fallback
        }

        // Add to local state (works on static hosting!)
        const newDonation = {
            ...formData,
            id: Date.now(),
            status: 'AVAILABLE',
            created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        AppState.donations.unshift(newDonation);
        saveLocalDonations(AppState.donations);
        showToast('🎉 Surplus food listed successfully for NGO pickup!', 'success');
        donationForm.reset();
        window.DonationValidator.resetAllErrors(donationForm);
        setDefaultDateTime();
        updateSummaryCounters();
        renderDonorPortal();
        renderNgoPortal();

        submitBtn.disabled = false;
        submitBtn.textContent = 'List Donation';
    });
}

// ================================================================
// 6. FRESHNESS & STATUS HELPERS
// ================================================================
function calculateFreshness(expiryTimeStr) {
    const expiryDate = new Date(expiryTimeStr);
    const now = new Date();
    const diffMs = expiryDate - now;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffHours <= 0) {
        return {
            label: 'Expired',
            className: 'freshness-expired',
            dotClass: 'dot-red',
            category: 'EXPIRED'
        };
    } else if (diffHours <= 5) {
        return {
            label: `Expires in ${diffHours} hr${diffHours === 1 ? '' : 's'}`,
            className: 'freshness-expiring',
            dotClass: 'dot-yellow',
            category: 'EXPIRING'
        };
    } else if (diffHours <= 24) {
        return {
            label: `Expires in ${diffHours} hours`,
            className: 'freshness-fresh',
            dotClass: 'dot-green',
            category: 'FRESH'
        };
    } else {
        const days = Math.round(diffHours / 24);
        return {
            label: `Fresh (${days} day${days === 1 ? '' : 's'} left)`,
            className: 'freshness-fresh',
            dotClass: 'dot-green',
            category: 'FRESH'
        };
    }
}

function getStatusBadge(status) {
    switch (status) {
        case 'AVAILABLE':
            return '<span class="badge badge-available">🟢 Available</span>';
        case 'ACCEPTED':
            return '<span class="badge badge-accepted">🤝 Accepted</span>';
        case 'PICKED UP':
            return '<span class="badge badge-picked-up">🚚 Picked Up</span>';
        case 'DELIVERED':
            return '<span class="badge badge-delivered">✅ Delivered</span>';
        case 'EXPIRED':
            return '<span class="badge badge-expired">❌ Expired</span>';
        default:
            return `<span class="badge">${status}</span>`;
    }
}

// ================================================================
// 7. DONOR PORTAL RENDERING & FILTERING
// ================================================================
function initFilters() {
    const donorStatusSelect = document.getElementById('filter-donor-status');
    const donorCatSelect = document.getElementById('filter-donor-category');

    if (donorStatusSelect) {
        donorStatusSelect.addEventListener('change', (e) => {
            AppState.donorFilterStatus = e.target.value;
            renderDonorPortal();
        });
    }

    if (donorCatSelect) {
        donorCatSelect.addEventListener('change', (e) => {
            AppState.donorFilterCategory = e.target.value;
            renderDonorPortal();
        });
    }

    const ngoStateSelect = document.getElementById('ngo-state-select');
    if (ngoStateSelect) {
        ngoStateSelect.addEventListener('change', (e) => {
            AppState.selectedState = e.target.value;
            const stateDisplay = document.getElementById('ngo-selected-state-display');
            if (stateDisplay) stateDisplay.textContent = e.target.value.toUpperCase();
            renderNgoPortal();
        });
    }

    const ngoTypeSelect = document.getElementById('filter-ngo-type');
    const ngoFreshSelect = document.getElementById('filter-ngo-freshness');

    if (ngoTypeSelect) {
        ngoTypeSelect.addEventListener('change', (e) => {
            AppState.ngoFilterType = e.target.value;
            renderNgoPortal();
        });
    }

    if (ngoFreshSelect) {
        ngoFreshSelect.addEventListener('change', (e) => {
            AppState.ngoFilterFreshness = e.target.value;
            renderNgoPortal();
        });
    }
}

function renderDonorPortal() {
    const container = document.getElementById('donor-donations-list');
    if (!container) return;

    let filtered = AppState.donations.filter(donation => {
        const matchesStatus = AppState.donorFilterStatus === 'ALL' || donation.status === AppState.donorFilterStatus;
        const matchesCategory = AppState.donorFilterCategory === 'ALL' || donation.category === AppState.donorFilterCategory;
        return matchesStatus && matchesCategory;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">📦</div>
                <div class="empty-title">No donations found</div>
                <p class="empty-text">There are no food donations matching your active filter criteria. Click "List Donation" above to add new surplus food.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(donation => {
        const freshness = calculateFreshness(donation.expiry_time);
        const statusBadge = getStatusBadge(donation.status);

        return `
            <div class="donation-card">
                <div>
                    <div class="card-top">
                        <div class="card-food-name">${escapeHTML(donation.food_name)}</div>
                    </div>
                    
                    <div class="card-badges-row">
                        ${statusBadge}
                        <span class="dietary-tag">${donation.food_type}</span>
                        <span class="freshness-tag ${freshness.className}">
                            <span class="dot ${freshness.dotClass}"></span> ${freshness.label}
                        </span>
                    </div>

                    <ul class="card-details-list">
                        <li class="card-detail-item">
                            <span class="card-detail-icon">⚖️</span>
                            <span><strong>Quantity:</strong> ${donation.quantity} ${donation.unit} (${donation.category})</span>
                        </li>
                        <li class="card-detail-item">
                            <span class="card-detail-icon">📍</span>
                            <span><strong>Location:</strong> ${escapeHTML(donation.pickup_location)}, ${donation.state}</span>
                        </li>
                        <li class="card-detail-item">
                            <span class="card-detail-icon">🕒</span>
                            <span><strong>Safe Until:</strong> ${formatDate(donation.expiry_time)}</span>
                        </li>
                        ${donation.description ? `
                        <li class="card-detail-item">
                            <span class="card-detail-icon">📝</span>
                            <span><em>"${escapeHTML(donation.description)}"</em></span>
                        </li>` : ''}
                    </ul>
                </div>

                <div class="card-actions">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Listing #${donation.id}</span>
                    <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">
                        ${donation.status === 'AVAILABLE' ? 'Awaiting NGO pickup' : `Status: ${donation.status}`}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// ================================================================
// 8. NGO PORTAL RENDERING & LIFECYCLE
// ================================================================
function renderNgoPortal() {
    const container = document.getElementById('ngo-donations-list');
    if (!container) return;

    const selectedState = AppState.selectedState;
    const activeTab = AppState.activeNgoTab;

    let stateDonations = AppState.donations.filter(d => 
        d.state.toLowerCase() === selectedState.toLowerCase()
    );

    let tabDonations = [];
    if (activeTab === 'available') {
        tabDonations = stateDonations.filter(d => d.status === 'AVAILABLE');
    } else if (activeTab === 'accepted') {
        tabDonations = stateDonations.filter(d => d.status === 'ACCEPTED');
    } else if (activeTab === 'history') {
        tabDonations = stateDonations.filter(d => d.status === 'PICKED UP' || d.status === 'DELIVERED');
    }

    let filtered = tabDonations.filter(d => {
        const matchesType = AppState.ngoFilterType === 'ALL' || d.food_type === AppState.ngoFilterType;
        const freshness = calculateFreshness(d.expiry_time);
        const matchesFreshness = AppState.ngoFilterFreshness === 'ALL' || freshness.category === AppState.ngoFilterFreshness;
        return matchesType && matchesFreshness;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">🔍</div>
                <div class="empty-title">No donations found in ${selectedState}</div>
                <p class="empty-text">There are currently no items in this tab for ${selectedState}. Try selecting a different state from the dropdown or check back soon!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(donation => {
        const freshness = calculateFreshness(donation.expiry_time);
        const statusBadge = getStatusBadge(donation.status);

        let actionButton = '';
        if (donation.status === 'AVAILABLE') {
            actionButton = `
                <button class="btn btn-primary btn-sm" onclick="acceptDonation(${donation.id})">
                    🤝 Accept Donation
                </button>
            `;
        } else if (donation.status === 'ACCEPTED') {
            actionButton = `
                <button class="btn btn-accent btn-sm" onclick="pickupDonation(${donation.id})">
                    🚚 Mark Picked Up
                </button>
            `;
        } else if (donation.status === 'PICKED UP') {
            actionButton = `
                <button class="btn btn-primary btn-sm" style="background-color: var(--accent-green);" onclick="deliverDonation(${donation.id})">
                    ✅ Mark Delivered
                </button>
            `;
        } else if (donation.status === 'DELIVERED') {
            actionButton = `
                <span class="badge badge-delivered">Distributed to Community</span>
            `;
        }

        return `
            <div class="donation-card">
                <div>
                    <div class="card-top">
                        <div class="card-food-name">${escapeHTML(donation.food_name)}</div>
                    </div>
                    
                    <div class="card-badges-row">
                        ${statusBadge}
                        <span class="dietary-tag">${donation.food_type}</span>
                        <span class="freshness-tag ${freshness.className}">
                            <span class="dot ${freshness.dotClass}"></span> ${freshness.label}
                        </span>
                    </div>

                    <ul class="card-details-list">
                        <li class="card-detail-item">
                            <span class="card-detail-icon">⚖️</span>
                            <span><strong>Quantity:</strong> ${donation.quantity} ${donation.unit} (${donation.category})</span>
                        </li>
                        <li class="card-detail-item">
                            <span class="card-detail-icon">📍</span>
                            <span><strong>Pickup Address:</strong> ${escapeHTML(donation.pickup_location)}</span>
                        </li>
                        <li class="card-detail-item">
                            <span class="card-detail-icon">🕒</span>
                            <span><strong>Safe to Eat Until:</strong> ${formatDate(donation.expiry_time)}</span>
                        </li>
                        ${donation.description ? `
                        <li class="card-detail-item">
                            <span class="card-detail-icon">📝</span>
                            <span><em>"${escapeHTML(donation.description)}"</em></span>
                        </li>` : ''}
                    </ul>
                </div>

                <div class="card-actions">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${donation.state}</span>
                    <div>${actionButton}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ================================================================
// 9. LIFECYCLE ACTION HANDLERS (PUT REQUESTS + LOCAL MUTATIONS)
// ================================================================
async function acceptDonation(donationId) {
    try {
        const ngoId = AppState.currentUser ? AppState.currentUser.id : 7;
        const res = await fetch(`${API_BASE_URL}/donations/${donationId}/accept`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ngo_id: ngoId })
        });
        if (res.ok) {
            const result = await res.json();
            if (result.success) {
                showToast('🤝 Donation accepted! Scheduled for volunteer pickup.', 'success');
                await loadDashboardData();
                AppState.activeNgoTab = 'accepted';
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.toggle('active', b.getAttribute('data-tab') === 'accepted');
                });
                renderNgoPortal();
                return;
            }
        }
    } catch (err) {}

    // Local mutation for instant UI response / static hosting
    const donation = AppState.donations.find(d => d.id === donationId);
    if (donation) donation.status = 'ACCEPTED';
    saveLocalDonations(AppState.donations);
    showToast('🤝 Donation accepted! Scheduled for volunteer pickup.', 'success');
    updateSummaryCounters();
    AppState.activeNgoTab = 'accepted';
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === 'accepted');
    });
    renderNgoPortal();
}
window.acceptDonation = acceptDonation;

async function pickupDonation(donationId) {
    try {
        const res = await fetch(`${API_BASE_URL}/donations/${donationId}/pickup`, {
            method: 'PUT'
        });
        if (res.ok) {
            const result = await res.json();
            if (result.success) {
                showToast('🚚 Food collected from donor! In transit to shelter.', 'info');
                await loadDashboardData();
                return;
            }
        }
    } catch (err) {}

    const donation = AppState.donations.find(d => d.id === donationId);
    if (donation) donation.status = 'PICKED UP';
    saveLocalDonations(AppState.donations);
    showToast('🚚 Food collected from donor! In transit to shelter.', 'info');
    updateSummaryCounters();
    renderNgoPortal();
}
window.pickupDonation = pickupDonation;

async function deliverDonation(donationId) {
    try {
        const res = await fetch(`${API_BASE_URL}/donations/${donationId}/deliver`, {
            method: 'PUT'
        });
        if (res.ok) {
            const result = await res.json();
            if (result.success) {
                showToast('🎉 Food successfully distributed to community shelter!', 'success');
                await loadDashboardData();
                return;
            }
        }
    } catch (err) {}

    const donation = AppState.donations.find(d => d.id === donationId);
    if (donation) donation.status = 'DELIVERED';
    saveLocalDonations(AppState.donations);
    showToast('🎉 Food successfully distributed to community shelter!', 'success');
    updateSummaryCounters();
    renderNgoPortal();
}
window.deliverDonation = deliverDonation;

// ================================================================
// 10. UTILITIES
// ================================================================
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
