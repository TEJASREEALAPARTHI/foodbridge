/**
 * FOODBRIDGE MAIN APPLICATION CONTROLLER
 * Coordinates Role Switching, Tab Navigation, Global Data Synchronization,
 * Toast Notifications, Modals, and Interview Guide Drawer.
 */

const App = {
    currentRole: "NGO", // Default starting view

    init() {
        console.log("Initializing FoodBridge Application...");
        this.bindGlobalEvents();

        // Initialize sub-controllers
        if (window.DonorController) DonorController.init();
        if (window.NgoController) NgoController.init();
        if (window.PickupController) PickupController.init();
        if (window.AdminController) AdminController.init();

        // Set initial view
        this.switchRole(this.currentRole);

        // Start live time ticker for expiry sync
        setInterval(() => this.tickLiveTime(), 30000);
    },

    bindGlobalEvents() {
        // Role Switcher Buttons
        document.querySelectorAll(".role-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const role = btn.dataset.role;
                if (role) this.switchRole(role);
            });
        });

        // NGO View Sub-Tabs (Find Food vs My Requests)
        document.querySelectorAll(".ngo-subtab").forEach(tab => {
            tab.addEventListener("click", (e) => {
                const targetView = tab.dataset.tab;
                document.querySelectorAll(".ngo-subtab").forEach(t => t.classList.remove("active"));
                tab.classList.add("active");

                const findView = document.getElementById("ngo-find-food-view");
                const requestsView = document.getElementById("ngo-my-requests-view");

                if (targetView === "find") {
                    if (findView) findView.style.display = "block";
                    if (requestsView) requestsView.style.display = "none";
                    NgoController.loadAvailableDonations();
                } else {
                    if (findView) findView.style.display = "none";
                    if (requestsView) requestsView.style.display = "block";
                    PickupController.loadRequestsView();
                }
            });
        });

        // Modal backdrop click to close
        document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
            backdrop.addEventListener("click", (e) => {
                if (e.target === backdrop) {
                    this.closeModal(backdrop.id);
                }
            });
        });

        // Interview Cheat Sheet Drawer Toggle
        const drawerToggleBtn = document.getElementById("btn-toggle-interview-drawer");
        const drawerCloseBtn = document.getElementById("btn-close-interview-drawer");
        const drawer = document.getElementById("interview-drawer");

        if (drawerToggleBtn && drawer) {
            drawerToggleBtn.addEventListener("click", () => drawer.classList.toggle("open"));
        }
        if (drawerCloseBtn && drawer) {
            drawerCloseBtn.addEventListener("click", () => drawer.classList.remove("open"));
        }
    },

    // Switches between DONOR, NGO, and ADMIN roles
    switchRole(role) {
        this.currentRole = role;

        // Update role button UI
        document.querySelectorAll(".role-btn").forEach(btn => {
            if (btn.dataset.role === role) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        // Toggle role containers
        const donorSection = document.getElementById("role-donor-section");
        const ngoSection = document.getElementById("role-ngo-section");
        const adminSection = document.getElementById("role-admin-section");

        if (donorSection) donorSection.style.display = role === "DONOR" ? "block" : "none";
        if (ngoSection) ngoSection.style.display = role === "NGO" ? "block" : "none";
        if (adminSection) adminSection.style.display = role === "ADMIN" ? "block" : "none";

        // Refresh relevant views
        if (role === "DONOR") DonorController.loadDashboard();
        if (role === "NGO") {
            NgoController.loadAvailableDonations();
            NgoController.loadNgoDashboardStats();
        }
        if (role === "ADMIN") AdminController.loadAdminView();

        this.showToast(`Switched active workspace to ${role} Portal`, "info");
    },

    // SINGLE SOURCE OF TRUTH SYNCHRONIZER: Re-fetches all active views from DB
    refreshAllData() {
        console.log("Refreshing all views from Single Source of Truth database...");
        if (window.DonorController) DonorController.loadDashboard();
        if (window.NgoController) {
            NgoController.loadAvailableDonations();
            NgoController.loadNgoDashboardStats();
        }
        if (window.PickupController) PickupController.loadRequestsView();
        if (window.AdminController) AdminController.loadAdminView();
    },

    // Ticks periodic expiry and updates badge countdowns
    tickLiveTime() {
        if (this.currentRole === "NGO") {
            NgoController.loadAvailableDonations();
        } else if (this.currentRole === "DONOR") {
            DonorController.loadDashboard();
        }
    },

    // Modal Manager
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add("active");
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove("active");
    },

    // View Detailed Donation Modal
    async viewDonationDetails(donationId) {
        try {
            const d = await ApiService.getDonationById(donationId);
            const urgency = ExpiryEngine.getUrgencyTier(d.best_before);
            const remaining = ExpiryEngine.formatRemainingTime(d.best_before);

            const contentEl = document.getElementById("donation-details-content");
            if (!contentEl) return;

            contentEl.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <h3 style="font-size: 1.3rem; margin-bottom: 0.25rem;">${d.food_name}</h3>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">Donation ID: #${d.donation_id}</div>
                    </div>
                    <span class="status-pill ${d.status.toLowerCase()}">${d.status.replace('_', ' ')}</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: var(--surface-subtle); padding: 1.15rem; border-radius: var(--radius-md); font-size: 0.86rem;">
                    <div>🥗 <strong>Dietary Type:</strong> ${d.dietary_type.replace('_', ' ')}</div>
                    <div>📂 <strong>Category:</strong> ${d.category_name}</div>
                    <div>🍛 <strong>Cuisine:</strong> ${d.cuisine}</div>
                    <div>📦 <strong>Quantity:</strong> ${d.quantity} ${d.unit.toLowerCase()}</div>
                    <div>❄️ <strong>Storage:</strong> ${d.storage_condition.replace('_', ' ')}</div>
                    <div>⏱️ <strong>Shelf Life:</strong> <span class="urgency-badge ${urgency.cssClass}">${urgency.icon} ${remaining}</span></div>
                    <div>🕒 <strong>Prepared At:</strong> ${ExpiryEngine.formatDateTime(d.prepared_at)}</div>
                    <div>⏳ <strong>Best Before:</strong> ${ExpiryEngine.formatDateTime(d.best_before)}</div>
                </div>

                <div style="margin-top: 1rem; font-size: 0.86rem;">
                    <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">🏢 Donor Organization</div>
                    <div>${d.donor_name} (${d.donor_type})</div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">📍 ${d.donor_address || d.locality}, ${d.city}, ${d.state}</div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">📞 ${d.donor_phone || 'N/A'}</div>
                </div>

                ${d.description ? `
                    <div style="margin-top: 1rem; font-size: 0.86rem;">
                        <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">📝 Description & Handling Notes</div>
                        <p style="font-size: 0.82rem; color: var(--text-secondary); background: #FFFFFF; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); margin: 0;">
                            ${d.description}
                        </p>
                    </div>
                ` : ''}

                ${d.claiming_ngo_name ? `
                    <div style="margin-top: 1rem; font-size: 0.86rem; background: #EFF6FF; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid #BFDBFE;">
                        <div style="font-weight: 700; color: #1D4ED8; margin-bottom: 0.2rem;">🤝 Claimed by NGO</div>
                        <div>${d.claiming_ngo_name} &bull; 📞 ${d.claiming_ngo_phone || 'N/A'}</div>
                    </div>
                ` : ''}
            `;

            // Setup footer action inside modal based on status & role
            const footerEl = document.getElementById("donation-details-footer");
            if (footerEl) {
                if (d.status === "AVAILABLE" && this.currentRole === "NGO") {
                    footerEl.innerHTML = `
                        <button class="btn btn-secondary btn-sm" onclick="App.closeModal('details-modal')">Close</button>
                        <button class="btn btn-primary btn-sm" onclick="App.closeModal('details-modal'); NgoController.handleAcceptDonation(${d.donation_id})">
                            Accept Donation
                        </button>
                    `;
                } else if (d.status === "ACCEPTED" && this.currentRole === "NGO") {
                    footerEl.innerHTML = `
                        <button class="btn btn-secondary btn-sm" onclick="App.closeModal('details-modal')">Close</button>
                        <button class="btn btn-primary btn-sm" onclick="App.closeModal('details-modal'); PickupController.openScheduleModal(${d.donation_id}, '${escapeHtml(d.food_name)}')">
                            📅 Schedule Pickup
                        </button>
                    `;
                } else {
                    footerEl.innerHTML = `
                        <button class="btn btn-secondary btn-sm" onclick="App.closeModal('details-modal')">Close</button>
                    `;
                }
            }

            this.openModal("details-modal");
        } catch (err) {
            this.showToast("Failed to fetch donation details.", "error");
        }
    },

    // Toast Notification Dispatcher
    showToast(message, type = "info", duration = 3500) {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast ${type}`;

        const icons = {
            success: "✅",
            error: "❌",
            warning: "⚠️",
            info: "ℹ️"
        };

        const titles = {
            success: "Success",
            error: "Alert",
            warning: "Notice",
            info: "Information"
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || "ℹ️"}</div>
            <div class="toast-body">
                <div class="toast-title">${titles[type] || "Update"}</div>
                <div class="toast-msg">${message}</div>
            </div>
        `;

        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add("show"), 10);

        // Auto dismiss
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// Bootstrap application on DOM ready
document.addEventListener("DOMContentLoaded", () => App.init());
window.App = App;
