/**
 * FOODBRIDGE EXPIRY & URGENCY ENGINE
 * Calculates real-time time differentials, classifications, and PriorityQueue sorting logic.
 */

const ExpiryEngine = {
    // Computes difference in milliseconds between current time and best-before timestamp
    getRemainingMs(bestBeforeISO) {
        const target = new Date(bestBeforeISO).getTime();
        const now = Date.now();
        return target - now;
    },

    // Checks if the timestamp is already past
    isExpired(bestBeforeISO) {
        return this.getRemainingMs(bestBeforeISO) <= 0;
    },

    // Returns human-readable relative expiry string
    formatRemainingTime(bestBeforeISO) {
        const diffMs = this.getRemainingMs(bestBeforeISO);
        
        if (diffMs <= 0) {
            return "Expired";
        }

        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `Expires in ${days}d ${hours % 24}h`;
        }
        if (hours > 0) {
            return `Expires in ${hours}h ${minutes}m`;
        }
        return `Expires in ${minutes}m`;
    },

    // Returns Urgency classification: URGENT (<2 hrs), WARNING (2-6 hrs), NORMAL (>6 hrs), EXPIRED
    getUrgencyTier(bestBeforeISO) {
        const diffMs = this.getRemainingMs(bestBeforeISO);
        if (diffMs <= 0) {
            return {
                tier: "EXPIRED",
                label: "Expired",
                cssClass: "expired",
                icon: "⚠️"
            };
        }

        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 2) {
            return {
                tier: "URGENT",
                label: "Urgent (< 2h)",
                cssClass: "urgent",
                icon: "🔥"
            };
        }
        if (diffHours <= 6) {
            return {
                tier: "WARNING",
                label: "Moderate (2–6h)",
                cssClass: "warning",
                icon: "⏱️"
            };
        }
        return {
            tier: "NORMAL",
            label: "Good (> 6h)",
            cssClass: "normal",
            icon: "✅"
        };
    },

    // Formats a date string nicely (e.g., "Aug 24, 2026 at 7:30 PM")
    formatDateTime(dateISO) {
        if (!dateISO) return "N/A";
        const date = new Date(dateISO);
        return date.toLocaleString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    },

    // Expiry Priority Queue Comparator (Soonest expiring first)
    compareByUrgencyAsc(donationA, donationB) {
        const timeA = new Date(donationA.best_before).getTime();
        const timeB = new Date(donationB.best_before).getTime();
        return timeA - timeB;
    }
};

window.ExpiryEngine = ExpiryEngine;
