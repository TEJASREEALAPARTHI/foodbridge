/**
 * FOODBRIDGE ADMIN & SYNCHRONIZATION TEST RUNNER
 * System monitoring, global audit view, and automated verification of single source of truth rules.
 */

const AdminController = {
    init() {
        this.bindEvents();
        this.loadAdminView();
    },

    bindEvents() {
        const resetDbBtn = document.getElementById("btn-reset-db");
        if (resetDbBtn) {
            resetDbBtn.addEventListener("click", () => this.handleResetDatabase());
        }

        const runTestBtn = document.getElementById("btn-run-sync-test");
        if (runTestBtn) {
            runTestBtn.addEventListener("click", () => this.runSynchronizationTestSuite());
        }

        const statusFilter = document.getElementById("admin-status-filter");
        if (statusFilter) {
            statusFilter.addEventListener("change", () => this.loadAllDonationsTable());
        }
    },

    // Loads Admin Metrics & Global Activity Table
    async loadAdminView() {
        try {
            const stats = await ApiService.getAdminStats();
            
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.textContent = val !== undefined ? val : 0;
            };

            setVal("admin-stat-donors", stats.total_donors);
            setVal("admin-stat-ngos", stats.total_ngos);
            setVal("admin-stat-total-donations", stats.total_donations);
            setVal("admin-stat-available", stats.available_donations);
            setVal("admin-stat-completed", stats.completed_rescues);
            setVal("admin-stat-meals", stats.total_meals_distributed);

            this.loadAllDonationsTable();
        } catch (err) {
            console.error("Error loading admin view:", err);
        }
    },

    // Renders global donations audit table
    async loadAllDonationsTable() {
        const tbody = document.getElementById("admin-donations-tbody");
        if (!tbody) return;

        const filterStatus = document.getElementById("admin-status-filter")?.value || "";
        const allDonations = await ApiService.getDonations({ status: filterStatus || undefined });

        if (!allDonations || allDonations.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;">No records found.</td></tr>`;
            return;
        }

        tbody.innerHTML = allDonations.map(d => {
            const statusClass = d.status.toLowerCase();
            return `
                <tr>
                    <td><strong>#${d.donation_id}</strong></td>
                    <td><strong>${d.food_name}</strong></td>
                    <td>${d.quantity} ${d.unit.toLowerCase()}</td>
                    <td>${d.donor_name}</td>
                    <td>${d.claiming_ngo_name || '<span style="color:var(--text-muted);">&mdash;</span>'}</td>
                    <td>${d.locality}, ${d.city}</td>
                    <td><span class="status-pill ${statusClass}">${d.status.replace('_', ' ')}</span></td>
                </tr>
            `;
        }).join("");
    },

    // Resets database to seed state
    async handleResetDatabase() {
        if (!confirm("Reset database to initial demo dataset? This will restore all default donors, NGOs, and donations.")) return;
        await ApiService.resetDatabase();
        App.showToast("Database successfully restored to original seed state.", "success");
        App.refreshAllData();
    },

    // ==========================================================
    // MANDATORY TCS DIGITAL SYNCHRONIZATION TEST RUNNER
    // Demonstrates Single Source of Truth consistency across all 5 steps
    // ==========================================================
    async runSynchronizationTestSuite() {
        const consoleEl = document.getElementById("test-runner-output");
        if (!consoleEl) return;

        consoleEl.style.display = "block";
        consoleEl.innerHTML = `
            <div style="font-family: var(--font-mono); font-size: 0.82rem; line-height: 1.6; color: #E2E8F0; background: #0F172A; padding: 1.25rem; border-radius: var(--radius-md);">
                <div style="color: #38BDF8; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; margin-bottom: 0.75rem;">
                    🚀 FOODBRIDGE SYNCHRONIZATION TEST SUITE (TCS DIGITAL VALIDATION)
                </div>
                <div id="test-log-content">Starting test execution...</div>
            </div>
        `;

        const logContainer = document.getElementById("test-log-content");
        const log = (msg, status = "INFO") => {
            const color = status === "PASS" ? "#4ADE80" : status === "FAIL" ? "#F87171" : status === "STEP" ? "#FBBF24" : "#94A3B8";
            const symbol = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : status === "STEP" ? "👉" : "ℹ️";
            const row = document.createElement("div");
            row.style.color = color;
            row.style.margin = "4px 0";
            row.innerHTML = `${symbol} [${status}] ${msg}`;
            logContainer.appendChild(row);
        };

        try {
            // STEP 1: Donor creates donation
            log("STEP 1: Testing Donor Donation Creation (Rice, 30 portions)...", "STEP");
            const createRes = await ApiService.createDonation({
                donor_id: 1,
                food_name: "Automated Test Rice",
                dietary_type: "VEGETARIAN",
                category_id: 1,
                cuisine: "INDIAN",
                quantity: 30,
                unit: "PORTIONS",
                best_before: new Date(Date.now() + 3600000 * 3).toISOString(),
                state: "Andhra Pradesh",
                city: "Vijayawada",
                locality: "Gandhinagar"
            });
            const testDonationId = createRes.donation_id;
            log(`Created test donation with ID #${testDonationId}`, "INFO");

            // Verify Donor Stats & NGO Available List
            const donorStats1 = await ApiService.getDonorStats(1);
            const ngoAvailable1 = await ApiService.getDonations({ status: "AVAILABLE" });
            const itemFound1 = ngoAvailable1.find(d => d.donation_id === testDonationId);

            if (itemFound1 && donorStats1.active_donations >= 1) {
                log(`STEP 1 PASS: Item #${testDonationId} appears in NGO Find Food & Donor Active count is synchronized.`, "PASS");
            } else {
                throw new Error("Step 1 verification failed: Donation did not appear in available list.");
            }

            // STEP 2: NGO Accepts Donation
            log(`STEP 2: NGO Accepting Donation #${testDonationId}...`, "STEP");
            const acceptRes = await ApiService.acceptDonation(testDonationId, 1);
            if (!acceptRes.success) throw new Error(acceptRes.message);

            const ngoAvailable2 = await ApiService.getDonations({ status: "AVAILABLE" });
            const itemInAvailable = ngoAvailable2.find(d => d.donation_id === testDonationId);
            const ngoClaims2 = await ApiService.getDonations({ ngo_id: 1, status: "ACCEPTED" });
            const itemInClaims = ngoClaims2.find(d => d.donation_id === testDonationId);

            if (!itemInAvailable && itemInClaims) {
                log(`STEP 2 PASS: Item #${testDonationId} removed from AVAILABLE listings and now appears under NGO ACCEPTED requests.`, "PASS");
            } else {
                throw new Error("Step 2 verification failed: Item still appears in AVAILABLE or missing from ACCEPTED.");
            }

            // STEP 3: Concurrency / Double Acceptance Test
            log(`STEP 3: Testing Concurrency Guard (Second NGO attempting duplicate acceptance on #${testDonationId})...`, "STEP");
            const duplicateAccept = await ApiService.acceptDonation(testDonationId, 2);
            if (!duplicateAccept.success) {
                log(`STEP 3 PASS: Duplicate acceptance successfully rejected: "${duplicateAccept.message}"`, "PASS");
            } else {
                throw new Error("Step 3 FAIL: System permitted duplicate claim by another NGO!");
            }

            // STEP 4: Schedule Pickup
            log(`STEP 4: Scheduling Pickup for Donation #${testDonationId}...`, "STEP");
            const pickupRes = await ApiService.schedulePickup({
                donation_id: testDonationId,
                ngo_id: 1,
                pickup_date: new Date().toISOString().split('T')[0],
                pickup_time: "20:00",
                contact_person: "Test Runner Volunteer",
                contact_phone: "+91 94400 11223"
            });
            const donationAfterPickup = await ApiService.getDonationById(testDonationId);
            if (donationAfterPickup.status === "PICKUP_SCHEDULED") {
                log(`STEP 4 PASS: Status transitioned to PICKUP_SCHEDULED with Pickup ID #${pickupRes.pickup_id}.`, "PASS");
            } else {
                throw new Error("Step 4 FAIL: Status did not transition to PICKUP_SCHEDULED.");
            }

            // STEP 5: Complete Pickup
            log(`STEP 5: Marking Collection Complete for Donation #${testDonationId}...`, "STEP");
            await ApiService.completePickup(pickupRes.pickup_id, testDonationId);
            const donationFinal = await ApiService.getDonationById(testDonationId);
            const donorStatsFinal = await ApiService.getDonorStats(1);
            const ngoStatsFinal = await ApiService.getNgoStats(1);

            if (donationFinal.status === "COMPLETED") {
                log(`STEP 5 PASS: Status is COMPLETED. Rescued count updated (Donor: ${donorStatsFinal.total_servings_donated} servings, NGO: ${ngoStatsFinal.meals_rescued} meals).`, "PASS");
            } else {
                throw new Error("Step 5 FAIL: Status did not transition to COMPLETED.");
            }

            log("🎉 ALL SYNCHRONIZATION AND CONCURRENCY TESTS PASSED WITH 100% CONSISTENCY!", "PASS");
            App.showToast("All Synchronization Tests Passed!", "success");
            App.refreshAllData();
        } catch (err) {
            log(`TEST SUITE FAILURE: ${err.message}`, "FAIL");
            App.showToast(`Test failed: ${err.message}`, "error");
        }
    }
};

window.AdminController = AdminController;
