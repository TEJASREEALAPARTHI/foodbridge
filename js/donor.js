/**
 * FOODBRIDGE DONOR CONTROLLER
 * Handles Donor Dashboard rendering, form validation, donation creation, and status tracking.
 */

const DonorController = {
    currentDonorId: 1, // Default to Sri Krishna Grand Restaurant

    // Initializes Donor Module
    init() {
        this.bindEvents();
        this.loadDashboard();
    },

    // Binds DOM events
    bindEvents() {
        const donateForm = document.getElementById("donate-food-form");
        if (donateForm) {
            donateForm.addEventListener("submit", (e) => this.handleCreateDonation(e));
        }

        // Setup cascading locations in donate modal
        const stateSelect = document.getElementById("donate-state");
        const citySelect = document.getElementById("donate-city");
        const localitySelect = document.getElementById("donate-locality");

        if (stateSelect) {
            LocationsManager.populateStateSelect(stateSelect, "Select State", "Andhra Pradesh");
            LocationsManager.populateCitySelect(citySelect, "Andhra Pradesh", "Select City", "Vijayawada");
            LocationsManager.populateLocalitySelect(localitySelect, "Andhra Pradesh", "Vijayawada", "Select Locality", "Gandhinagar");

            stateSelect.addEventListener("change", (e) => {
                const selectedState = e.target.value;
                LocationsManager.populateCitySelect(citySelect, selectedState, "Select City");
                if (localitySelect) localitySelect.innerHTML = `<option value="">Select Locality</option>`;
            });

            if (citySelect) {
                citySelect.addEventListener("change", (e) => {
                    const selectedState = stateSelect.value;
                    const selectedCity = e.target.value;
                    LocationsManager.populateLocalitySelect(localitySelect, selectedState, selectedCity, "Select Locality");
                });
            }
        }

        // Set default minimum datetime for best-before input (cannot pick past time)
        const bestBeforeInput = document.getElementById("donate-best-before");
        if (bestBeforeInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            bestBeforeInput.min = now.toISOString().slice(0, 16);
            
            // Default to 4 hours in the future
            const defaultTime = new Date(Date.now() + 4 * 3600 * 1000);
            defaultTime.setMinutes(defaultTime.getMinutes() - defaultTime.getTimezoneOffset());
            bestBeforeInput.value = defaultTime.toISOString().slice(0, 16);
        }
    },

    // Loads live aggregated metrics & recent donations
    async loadDashboard() {
        try {
            const stats = await ApiService.getDonorStats(this.currentDonorId);
            this.renderStats(stats);

            const donations = await ApiService.getDonations({ donor_id: this.currentDonorId });
            this.renderRecentDonations(donations);
        } catch (err) {
            console.error("Error loading donor dashboard:", err);
            App.showToast("Failed to load donor dashboard data.", "error");
        }
    },

    // Renders stat metric cards
    renderStats(stats) {
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val !== undefined ? val : 0;
        };

        setVal("donor-stat-active", stats.active_donations);
        setVal("donor-stat-accepted", stats.accepted_donations);
        setVal("donor-stat-scheduled", stats.pickup_scheduled);
        setVal("donor-stat-completed", stats.completed_donations);
        setVal("donor-stat-expired", stats.expired_donations);
        setVal("donor-stat-servings", stats.total_servings_donated);
    },

    // Renders Recent Donations Table (Source of truth directly from DB)
    renderRecentDonations(donations) {
        const tbody = document.getElementById("donor-donations-tbody");
        if (!tbody) return;

        if (!donations || donations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 2.5rem; text-align: center;">
                        <div class="empty-title">No donations registered yet</div>
                        <p class="empty-desc">Click "+ Donate Surplus Food" above to register your first meal rescue.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = donations.map(d => {
            const urgency = ExpiryEngine.getUrgencyTier(d.best_before);
            const remaining = ExpiryEngine.formatRemainingTime(d.best_before);
            const statusClass = d.status.toLowerCase();
            const claimingInfo = d.claiming_ngo_name ? `<strong>${d.claiming_ngo_name}</strong>` : `<span style="color: var(--text-muted);">&mdash;</span>`;

            return `
                <tr>
                    <td><strong>#${d.donation_id}</strong></td>
                    <td>
                        <div style="font-weight: 700; color: var(--text-primary);">${d.food_name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">${d.category_name} &bull; ${d.cuisine}</div>
                    </td>
                    <td><strong>${d.quantity}</strong> ${d.unit.toLowerCase()}</td>
                    <td>
                        <span class="urgency-badge ${urgency.cssClass}">
                            ${urgency.icon} ${remaining}
                        </span>
                    </td>
                    <td>${claimingInfo}</td>
                    <td>
                        <span class="status-pill ${statusClass}">${d.status.replace('_', ' ')}</span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 0.4rem;">
                            <button class="btn btn-secondary btn-sm" onclick="App.viewDonationDetails(${d.donation_id})">
                                Details
                            </button>
                            ${d.status === 'AVAILABLE' ? `
                                <button class="btn btn-danger btn-sm" onclick="DonorController.handleCancelDonation(${d.donation_id})">
                                    Cancel
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    },

    // Handles form submission with comprehensive validation
    async handleCreateDonation(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        const foodName = form["donate-food-name"].value.trim();
        const dietaryType = form["donate-dietary"].value;
        const categoryId = form["donate-category"].value;
        const cuisine = form["donate-cuisine"].value;
        const quantity = parseInt(form["donate-quantity"].value, 10);
        const unit = form["donate-unit"].value;
        const bestBefore = form["donate-best-before"].value;
        const storageCondition = form["donate-storage"].value;
        const description = form["donate-description"].value.trim();
        const state = form["donate-state"].value;
        const city = form["donate-city"].value;
        const locality = form["donate-locality"].value;

        // Front-end Validation checks
        if (!foodName) {
            App.showToast("Please enter a valid food title.", "error");
            return;
        }
        if (isNaN(quantity) || quantity <= 0) {
            App.showToast("Quantity must be a positive number greater than 0.", "error");
            return;
        }
        if (!bestBefore) {
            App.showToast("Please set a best-before expiration time.", "error");
            return;
        }
        if (new Date(bestBefore).getTime() <= Date.now()) {
            App.showToast("Best-before time must be set in the future.", "error");
            return;
        }
        if (!state || !city || !locality) {
            App.showToast("Please select the State, City, and Locality.", "error");
            return;
        }

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Registering Donation...";
            }

            const result = await ApiService.createDonation({
                donor_id: this.currentDonorId,
                food_name: foodName,
                dietary_type: dietaryType,
                category_id: categoryId,
                cuisine: cuisine,
                quantity: quantity,
                unit: unit,
                best_before: bestBefore,
                storage_condition: storageCondition,
                description: description,
                state: state,
                city: city,
                locality: locality
            });

            App.showToast(result.message, "success");
            App.closeModal("donate-modal");
            form.reset();

            // Refresh UI and synchronize all modules
            App.refreshAllData();
        } catch (err) {
            App.showToast(err.message || "Failed to register donation.", "error");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Register Donation";
            }
        }
    },

    // Handles donation cancellation
    async handleCancelDonation(donationId) {
        if (!confirm(`Are you sure you want to cancel donation #${donationId}?`)) return;

        try {
            const res = await ApiService.cancelDonation(donationId);
            App.showToast(res.message, "info");
            App.refreshAllData();
        } catch (err) {
            App.showToast(err.message || "Failed to cancel donation.", "error");
        }
    }
};

window.DonorController = DonorController;
