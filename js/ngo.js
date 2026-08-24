/**
 * FOODBRIDGE NGO CONTROLLER
 * Handles Available Food Discovery, Cascading Search/Filters, Proximity Ranking,
 * and Atomic Donation Acceptance Flow.
 */

const NgoController = {
    currentNgoId: 1, // Seva Food Relief Foundation
    currentNgoLocation: { state: "Andhra Pradesh", city: "Vijayawada", locality: "Gandhinagar" },

    init() {
        this.bindEvents();
        this.loadAvailableDonations();
        this.loadNgoDashboardStats();
    },

    bindEvents() {
        // Filter elements
        const searchInput = document.getElementById("filter-search");
        const stateSelect = document.getElementById("filter-state");
        const citySelect = document.getElementById("filter-city");
        const dietarySelect = document.getElementById("filter-dietary");
        const categorySelect = document.getElementById("filter-category");
        const sortSelect = document.getElementById("filter-sort");
        const resetBtn = document.getElementById("btn-reset-filters");

        // Initialize state select
        if (stateSelect) {
            LocationsManager.populateStateSelect(stateSelect, "All States", "");
            stateSelect.addEventListener("change", (e) => {
                const selectedState = e.target.value;
                LocationsManager.populateCitySelect(citySelect, selectedState, "All Cities");
                this.loadAvailableDonations();
            });
        }

        if (citySelect) {
            citySelect.addEventListener("change", () => this.loadAvailableDonations());
        }

        if (searchInput) {
            searchInput.addEventListener("input", () => this.debounceLoadDonations());
        }

        if (dietarySelect) {
            dietarySelect.addEventListener("change", () => this.loadAvailableDonations());
        }

        if (categorySelect) {
            categorySelect.addEventListener("change", () => this.loadAvailableDonations());
        }

        if (sortSelect) {
            sortSelect.addEventListener("change", () => this.loadAvailableDonations());
        }

        if (resetBtn) {
            resetBtn.addEventListener("click", () => this.resetFilters());
        }
    },

    debounceTimer: null,
    debounceLoadDonations() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.loadAvailableDonations(), 250);
    },

    resetFilters() {
        const searchInput = document.getElementById("filter-search");
        const stateSelect = document.getElementById("filter-state");
        const citySelect = document.getElementById("filter-city");
        const dietarySelect = document.getElementById("filter-dietary");
        const categorySelect = document.getElementById("filter-category");
        const sortSelect = document.getElementById("filter-sort");

        if (searchInput) searchInput.value = "";
        if (stateSelect) stateSelect.value = "";
        if (citySelect) {
            citySelect.innerHTML = `<option value="">All Cities</option>`;
            citySelect.disabled = true;
        }
        if (dietarySelect) dietarySelect.value = "";
        if (categorySelect) categorySelect.value = "";
        if (sortSelect) sortSelect.value = "urgency";

        this.loadAvailableDonations();
        App.showToast("Filters cleared.", "info");
    },

    // Fetches live statistics for the NGO dashboard header
    async loadNgoDashboardStats() {
        try {
            const stats = await ApiService.getNgoStats(this.currentNgoId);
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.textContent = val !== undefined ? val : 0;
            };

            setVal("ngo-stat-available", stats.available_in_platform);
            setVal("ngo-stat-pending", stats.pending_pickup);
            setVal("ngo-stat-scheduled", stats.scheduled_pickups);
            setVal("ngo-stat-completed", stats.completed_rescues);
            setVal("ngo-stat-meals", stats.meals_rescued);
        } catch (err) {
            console.error("Error loading NGO stats:", err);
        }
    },

    // Fetches and renders available donations matching user filters
    async loadAvailableDonations() {
        const container = document.getElementById("available-donations-grid");
        if (!container) return;

        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem;">
                <p>Loading fresh donations from database...</p>
            </div>
        `;

        try {
            const search = document.getElementById("filter-search")?.value || "";
            const state = document.getElementById("filter-state")?.value || "";
            const city = document.getElementById("filter-city")?.value || "";
            const dietary = document.getElementById("filter-dietary")?.value || "";
            const category = document.getElementById("filter-category")?.value || "";
            const sortBy = document.getElementById("filter-sort")?.value || "urgency";

            const filterParams = {
                status: "AVAILABLE",
                search,
                state,
                city,
                dietary_type: dietary,
                category_id: category,
                sortByUrgency: sortBy === "urgency"
            };

            let donations = await ApiService.getDonations(filterParams);

            if (sortBy === "quantity") {
                donations.sort((a, b) => b.quantity - a.quantity);
            } else if (sortBy === "name") {
                donations.sort((a, b) => a.food_name.localeCompare(b.food_name));
            }

            this.renderDonationCards(donations);
            this.loadNgoDashboardStats();
        } catch (err) {
            console.error("Error loading available donations:", err);
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">⚠️</div>
                    <div class="empty-title">Unable to load donations</div>
                    <p class="empty-desc">There was an issue fetching records from the server.</p>
                    <button class="btn btn-primary btn-sm" onclick="NgoController.loadAvailableDonations()">Retry</button>
                </div>
            `;
        }
    },

    // Renders donation cards in the Find Food grid
    renderDonationCards(donations) {
        const container = document.getElementById("available-donations-grid");
        if (!container) return;

        if (!donations || donations.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">🍽️</div>
                    <div class="empty-title">No Available Food Found</div>
                    <p class="empty-desc">No surplus food donations currently match your selected location and category filters.</p>
                    <button class="btn btn-outline-teal btn-sm" onclick="NgoController.resetFilters()">Clear Filters</button>
                </div>
            `;
            return;
        }

        container.innerHTML = donations.map(d => {
            const urgency = ExpiryEngine.getUrgencyTier(d.best_before);
            const remaining = ExpiryEngine.formatRemainingTime(d.best_before);
            const dietaryClass = d.dietary_type.toLowerCase().replace('_', '-');
            const proximity = LocationsManager.calculateProximityPriority(this.currentNgoLocation, { state: d.state, city: d.city, locality: d.locality });

            return `
                <div class="donation-card" id="donation-card-${d.donation_id}">
                    <div class="card-header-bar">
                        <span class="meta-tag ${dietaryClass}">
                            ${d.dietary_type.replace('_', ' ')}
                        </span>
                        <span class="urgency-badge ${urgency.cssClass}">
                            ${urgency.icon} ${remaining}
                        </span>
                    </div>

                    <div class="card-body">
                        <div class="food-title">${d.food_name}</div>
                        
                        <div class="food-meta-tags">
                            <span class="meta-tag">${d.category_name}</span>
                            <span class="meta-tag">${d.cuisine} Cuisine</span>
                        </div>

                        <div class="donation-detail-row">
                            <span>📦 Quantity:</span>
                            <strong>${d.quantity} ${d.unit.toLowerCase()}</strong>
                        </div>

                        <div class="donation-detail-row">
                            <span>🏢 Donor:</span>
                            <strong>${d.donor_name}</strong>
                        </div>

                        <div class="location-tag">
                            <span>📍</span>
                            <span>${d.locality}, ${d.city}, ${d.state}</span>
                            <span style="margin-left: auto; font-size: 0.7rem; font-weight: 700; color: var(--primary-accent);">
                                ${proximity.label}
                            </span>
                        </div>

                        ${d.description ? `
                            <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                ${d.description}
                            </p>
                        ` : ''}
                    </div>

                    <div class="card-footer-actions">
                        <button class="btn btn-secondary btn-sm" onclick="App.viewDonationDetails(${d.donation_id})">
                            View Details
                        </button>
                        <button 
                            class="btn btn-primary btn-sm" 
                            id="btn-accept-${d.donation_id}"
                            onclick="NgoController.handleAcceptDonation(${d.donation_id})"
                        >
                            Accept Donation
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    },

    // Handles atomic donation acceptance with double-claim prevention & UI disabling
    async handleAcceptDonation(donationId) {
        const acceptBtn = document.getElementById(`btn-accept-${donationId}`);
        if (acceptBtn) {
            acceptBtn.disabled = true;
            acceptBtn.textContent = "Accepting...";
        }

        try {
            const result = await ApiService.acceptDonation(donationId, this.currentNgoId);

            if (result.success) {
                App.showToast(result.message, "success");
                
                // Re-fetch and re-render all synchronized modules immediately
                App.refreshAllData();
            } else {
                App.showToast(result.message, "error");
                // Refresh list if the item is no longer valid
                this.loadAvailableDonations();
            }
        } catch (err) {
            App.showToast(err.message || "Failed to accept donation.", "error");
        } finally {
            if (acceptBtn) {
                acceptBtn.disabled = false;
                acceptBtn.textContent = "Accept Donation";
            }
        }
    }
};

window.NgoController = NgoController;
