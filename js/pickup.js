/**
 * FOODBRIDGE PICKUP & REQUEST CONTROLLER
 * Handles NGO Claims Management, Pickup Scheduling, Timeline Tracking, and Collection Completion.
 */

const PickupController = {
    currentNgoId: 1,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const scheduleForm = document.getElementById("schedule-pickup-form");
        if (scheduleForm) {
            scheduleForm.addEventListener("submit", (e) => this.handleSchedulePickupSubmit(e));
        }

        // Set default minimum date for pickup to today
        const dateInput = document.getElementById("pickup-date");
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            dateInput.value = today;
        }

        // Set default time to current time + 1 hour
        const timeInput = document.getElementById("pickup-time");
        if (timeInput) {
            const nextHour = new Date(Date.now() + 3600000);
            const hh = String(nextHour.getHours()).padStart(2, '0');
            const mm = String(nextHour.getMinutes()).padStart(2, '0');
            timeInput.value = `${hh}:${mm}`;
        }
    },

    // Loads NGO Claims, Scheduled Pickups, and History
    async loadRequestsView() {
        try {
            const allNgoDonations = await ApiService.getDonations({ ngo_id: this.currentNgoId });
            
            const pendingScheduling = allNgoDonations.filter(d => d.status === 'ACCEPTED');
            const activeScheduled = allNgoDonations.filter(d => d.status === 'PICKUP_SCHEDULED');
            const completedHistory = allNgoDonations.filter(d => d.status === 'COMPLETED');

            this.renderPendingScheduling(pendingScheduling);
            this.renderScheduledPickups(activeScheduled);
            this.renderCompletedHistory(completedHistory);
        } catch (err) {
            console.error("Error loading NGO requests:", err);
            App.showToast("Failed to load requests list.", "error");
        }
    },

    // Renders donations accepted but pending pickup scheduling
    renderPendingScheduling(donations) {
        const container = document.getElementById("pending-scheduling-list");
        if (!container) return;

        if (!donations || donations.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 1.75rem;">
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">
                        No pending claims. All accepted donations have scheduled pickups.
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = donations.map(d => `
            <div class="donation-card" style="border-left: 4px solid var(--info-accent);">
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div class="food-title">${d.food_name}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
                                From: <strong>${d.donor_name}</strong> &bull; ${d.locality}, ${d.city}
                            </div>
                        </div>
                        <span class="status-pill accepted">ACCEPTED</span>
                    </div>

                    <div class="donation-detail-row" style="margin-top: 0.4rem;">
                        <span>📦 Amount:</span>
                        <strong>${d.quantity} ${d.unit.toLowerCase()}</strong>
                        <span style="margin-left: 1rem;">📞 Donor Phone:</span>
                        <strong>${d.donor_phone || 'N/A'}</strong>
                    </div>

                    <div style="margin-top: 0.75rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
                        <button class="btn btn-secondary btn-sm" onclick="App.viewDonationDetails(${d.donation_id})">
                            Details
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="PickupController.openScheduleModal(${d.donation_id}, '${escapeHtml(d.food_name)}')">
                            📅 Schedule Pickup
                        </button>
                    </div>
                </div>
            </div>
        `).join("");
    },

    // Renders active scheduled pickups with contact & vehicle information
    renderScheduledPickups(donations) {
        const container = document.getElementById("scheduled-pickups-list");
        if (!container) return;

        if (!donations || donations.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 1.75rem;">
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">
                        No pickups currently scheduled.
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = donations.map(d => {
            const pickup = d.pickup_details || {};
            return `
                <div class="donation-card" style="border-left: 4px solid var(--primary-accent);">
                    <div class="card-body">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div class="food-title">${d.food_name}</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
                                    Pickup from: <strong>${d.donor_name}</strong> (${d.donor_address || d.locality})
                                </div>
                            </div>
                            <span class="status-pill pickup_scheduled">PICKUP SCHEDULED</span>
                        </div>

                        <div style="background: var(--surface-subtle); padding: 0.75rem 1rem; border-radius: var(--radius-md); margin-top: 0.6rem; font-size: 0.82rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.5rem;">
                            <div>📅 <strong>Date:</strong> ${pickup.pickup_date || 'Today'}</div>
                            <div>⏱️ <strong>Time:</strong> ${pickup.pickup_time || 'Pending'}</div>
                            <div>👤 <strong>Contact:</strong> ${pickup.contact_person || 'Volunteer'} (${pickup.contact_phone || 'N/A'})</div>
                            <div>🚚 <strong>Vehicle:</strong> ${pickup.vehicle_type || 'Van'}</div>
                        </div>

                        ${pickup.notes ? `
                            <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.4rem;">
                                📝 <em>Notes:</em> ${pickup.notes}
                            </p>
                        ` : ''}

                        <div style="margin-top: 0.75rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
                            <button class="btn btn-secondary btn-sm" onclick="App.viewDonationDetails(${d.donation_id})">
                                Details
                            </button>
                            <button 
                                class="btn btn-primary btn-sm" 
                                style="background: var(--success); border-color: var(--success);"
                                onclick="PickupController.handleCompleteCollection(${pickup.pickup_id || 0}, ${d.donation_id})"
                            >
                                ✅ Mark as Collected & Completed
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    },

    // Renders completed donations history
    renderCompletedHistory(donations) {
        const tbody = document.getElementById("ngo-history-tbody");
        if (!tbody) return;

        if (!donations || donations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        No completed food rescues recorded yet.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = donations.map(d => `
            <tr>
                <td><strong>#${d.donation_id}</strong></td>
                <td>
                    <strong>${d.food_name}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${d.category_name}</div>
                </td>
                <td><strong>${d.quantity}</strong> ${d.unit.toLowerCase()}</td>
                <td>${d.donor_name}</td>
                <td>${d.locality}, ${d.city}</td>
                <td><span class="status-pill completed">COMPLETED</span></td>
            </tr>
        `).join("");
    },

    // Opens schedule modal for given donation
    openScheduleModal(donationId, foodName) {
        const idInput = document.getElementById("schedule-donation-id");
        const titleSpan = document.getElementById("schedule-food-title");
        if (idInput) idInput.value = donationId;
        if (titleSpan) titleSpan.textContent = `Donation #${donationId} (${foodName})`;
        App.openModal("schedule-modal");
    },

    // Handles pickup submission
    async handleSchedulePickupSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');

        const donationId = form["schedule-donation-id"].value;
        const pickupDate = form["pickup-date"].value;
        const pickupTime = form["pickup-time"].value;
        const contactPerson = form["pickup-contact-person"].value.trim();
        const contactPhone = form["pickup-contact-phone"].value.trim();
        const vehicleType = form["pickup-vehicle"].value;
        const notes = form["pickup-notes"].value.trim();

        if (!pickupDate || !pickupTime) {
            App.showToast("Please enter both pickup date and time.", "error");
            return;
        }
        if (!contactPerson || !contactPhone) {
            App.showToast("Please provide volunteer contact details.", "error");
            return;
        }

        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Scheduling...";
            }

            const result = await ApiService.schedulePickup({
                donation_id: donationId,
                ngo_id: this.currentNgoId,
                pickup_date: pickupDate,
                pickup_time: pickupTime,
                contact_person: contactPerson,
                contact_phone: contactPhone,
                vehicle_type: vehicleType,
                notes: notes
            });

            App.showToast(result.message, "success");
            App.closeModal("schedule-modal");
            form.reset();

            // Refresh all synchronized views
            App.refreshAllData();
        } catch (err) {
            App.showToast(err.message || "Failed to schedule pickup.", "error");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Confirm Pickup Schedule";
            }
        }
    },

    // Handles marking collection complete
    async handleCompleteCollection(pickupId, donationId) {
        if (!confirm("Confirm that food has been safely collected and verified? This will mark the donation as COMPLETED.")) {
            return;
        }

        try {
            const result = await ApiService.completePickup(pickupId, donationId);
            App.showToast(result.message, "success");
            App.refreshAllData();
        } catch (err) {
            App.showToast(err.message || "Failed to mark as completed.", "error");
        }
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

window.PickupController = PickupController;
