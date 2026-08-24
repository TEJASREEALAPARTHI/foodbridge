/**
 * FOODBRIDGE LOCATIONS HIERARCHY
 * Normalized location dataset (State -> City -> Localities)
 * Handles cascading State/City dropdowns and rule-based proximity scoring.
 */

const LOCATIONS_DATA = {
    "Andhra Pradesh": {
        "Vijayawada": ["Gandhinagar", "Benz Circle", "Governorpet", "Patamata", "One Town", "Gunadala"],
        "Guntur": ["Arundelpet", "Brodipet", "Lakshmipuram", "Kothapet", "Pattabhipuram"],
        "Visakhapatnam": ["Dwaraka Nagar", "MVP Colony", "Gajuwaka", "Siripuram", "Madhurawada"],
        "Tirupati": ["Alipiri", "Bhavani Nagar", "Chandragiri Road", "Renigunta Road"]
    },
    "Telangana": {
        "Hyderabad": ["Madhapur", "Gachibowli", "Kukatpally", "Banjara Hills", "Jubilee Hills", "Secunderabad"],
        "Warangal": ["Hanamkonda", "Kazipet", "Subedari", "Nayeem Nagar"]
    },
    "Karnataka": {
        "Bengaluru": ["Indiranagar", "Koramangala", "Whitefield", "HSR Layout", "Jayanagar", "Hebbal"],
        "Mysuru": ["Gokulam", "Jayalakshmipuram", "KRS Road", "Saraswathipuram"]
    },
    "Tamil Nadu": {
        "Chennai": ["T. Nagar", "Anna Nagar", "Adyar", "Velachery", "Mylapore", "Guindy"],
        "Coimbatore": ["RS Puram", "Gandhipuram", "Peelamedu", "Saibaba Colony"]
    },
    "Maharashtra": {
        "Mumbai": ["Andheri West", "Bandra", "Dadar", "Powai", "Borivali", "Colaba"],
        "Pune": ["Kothrud", "Viman Nagar", "Hinjawadi", "Baner", "Wakad"]
    }
};

const LocationsManager = {
    // Returns list of all available states
    getStates() {
        return Object.keys(LOCATIONS_DATA);
    },

    // Returns cities within a given state
    getCities(state) {
        if (!state || !LOCATIONS_DATA[state]) return [];
        return Object.keys(LOCATIONS_DATA[state]);
    },

    // Returns localities within a city
    getLocalities(state, city) {
        if (!state || !city || !LOCATIONS_DATA[state] || !LOCATIONS_DATA[state][city]) return [];
        return LOCATIONS_DATA[state][city];
    },

    // Populates a <select> element with state options
    populateStateSelect(selectElement, defaultText = "Select State", selectedValue = "") {
        if (!selectElement) return;
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        this.getStates().forEach(state => {
            const opt = document.createElement("option");
            opt.value = state;
            opt.textContent = state;
            if (state === selectedValue) opt.selected = true;
            selectElement.appendChild(opt);
        });
    },

    // Cascades city options based on selected state
    populateCitySelect(selectElement, state, defaultText = "Select City", selectedValue = "") {
        if (!selectElement) return;
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        if (!state) {
            selectElement.disabled = true;
            return;
        }
        selectElement.disabled = false;
        const cities = this.getCities(state);
        cities.forEach(city => {
            const opt = document.createElement("option");
            opt.value = city;
            opt.textContent = city;
            if (city === selectedValue) opt.selected = true;
            selectElement.appendChild(opt);
        });
    },

    // Cascades locality options based on state & city
    populateLocalitySelect(selectElement, state, city, defaultText = "Select Locality", selectedValue = "") {
        if (!selectElement) return;
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        if (!state || !city) {
            selectElement.disabled = true;
            return;
        }
        selectElement.disabled = false;
        const localities = this.getLocalities(state, city);
        localities.forEach(loc => {
            const opt = document.createElement("option");
            opt.value = loc;
            opt.textContent = loc;
            if (loc === selectedValue) opt.selected = true;
            selectElement.appendChild(opt);
        });
    },

    // Rule-based location proximity priority score (Interview Concept)
    calculateProximityPriority(ngoLocation, donationLocation) {
        if (!ngoLocation || !donationLocation) return 4;
        if (ngoLocation.state === donationLocation.state &&
            ngoLocation.city === donationLocation.city &&
            ngoLocation.locality === donationLocation.locality) {
            return { rank: 1, label: "Same Locality", badgeClass: "badge-locality" };
        }
        if (ngoLocation.state === donationLocation.state &&
            ngoLocation.city === donationLocation.city) {
            return { rank: 2, label: "Same City", badgeClass: "badge-city" };
        }
        if (ngoLocation.state === donationLocation.state) {
            return { rank: 3, label: "Same State", badgeClass: "badge-state" };
        }
        return { rank: 4, label: "Other State", badgeClass: "badge-other" };
    }
};

window.LocationsManager = LocationsManager;
