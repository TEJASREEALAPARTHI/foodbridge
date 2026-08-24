// ================================================================
// public/js/validation.js - Client-Side Form Validation Module
// ================================================================
// EXPLANATION FOR INTERVIEWS:
// 1. Client-side validation catches mistakes BEFORE sending a network request.
//    This provides instant feedback to the user and saves server bandwidth.
// 2. We use standard JavaScript conditions: trim() for whitespace check,
//    parseFloat() and isNaN() for numbers, and new Date() for chronological checks.
// 3. We manipulate the DOM to toggle '.is-invalid' classes and show error spans.
// ================================================================

const DonationValidator = {
    // Show an inline error message for a specific field
    showError: function(inputElement, errorElement, message) {
        if (inputElement) {
            inputElement.classList.add('is-invalid');
        }
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    },

    // Clear error for a specific field
    clearError: function(inputElement, errorElement) {
        if (inputElement) {
            inputElement.classList.remove('is-invalid');
        }
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    },

    // Reset all errors in the form
    resetAllErrors: function(formElement) {
        const invalidInputs = formElement.querySelectorAll('.is-invalid');
        invalidInputs.forEach(input => input.classList.remove('is-invalid'));

        const errorSpans = formElement.querySelectorAll('.error-feedback');
        errorSpans.forEach(span => {
            span.textContent = '';
            span.classList.remove('show');
        });
    },

    // Main Validation Function: Returns true if valid, false if errors exist
    validateDonationForm: function(formData) {
        let isValid = true;

        // 1. Validate Food Name
        const nameInput = document.getElementById('input-food-name');
        const nameError = document.getElementById('error-food-name');
        if (!formData.food_name || formData.food_name.trim() === '') {
            this.showError(nameInput, nameError, 'Please enter the name of the food item.');
            isValid = false;
        } else if (formData.food_name.trim().length < 3) {
            this.showError(nameInput, nameError, 'Food name must be at least 3 characters.');
            isValid = false;
        } else {
            this.clearError(nameInput, nameError);
        }

        // 2. Validate Food Type
        const typeInput = document.getElementById('input-food-type');
        const typeError = document.getElementById('error-food-type');
        if (!formData.food_type) {
            this.showError(typeInput, typeError, 'Please select a food type (Veg/Non-Veg/Vegan).');
            isValid = false;
        } else {
            this.clearError(typeInput, typeError);
        }

        // 3. Validate Category
        const catInput = document.getElementById('input-category');
        const catError = document.getElementById('error-category');
        if (!formData.category) {
            this.showError(catInput, catError, 'Please select a food category.');
            isValid = false;
        } else {
            this.clearError(catInput, catError);
        }

        // 4. Validate Quantity
        const qtyInput = document.getElementById('input-quantity');
        const qtyError = document.getElementById('error-quantity');
        const numQty = parseFloat(formData.quantity);
        if (isNaN(numQty) || numQty <= 0) {
            this.showError(qtyInput, qtyError, 'Please enter a valid quantity greater than 0.');
            isValid = false;
        } else {
            this.clearError(qtyInput, qtyError);
        }

        // 5. Validate Unit
        const unitInput = document.getElementById('input-unit');
        const unitError = document.getElementById('error-unit');
        if (!formData.unit) {
            this.showError(unitInput, unitError, 'Please select a unit.');
            isValid = false;
        } else {
            this.clearError(unitInput, unitError);
        }

        // 6. Validate Prepared Time
        const prepInput = document.getElementById('input-prepared-time');
        const prepError = document.getElementById('error-prepared-time');
        if (!formData.prepared_time) {
            this.showError(prepInput, prepError, 'Please specify when the food was prepared.');
            isValid = false;
        } else {
            this.clearError(prepInput, prepError);
        }

        // 7. Validate Expiry Time (Must be in the FUTURE)
        const expInput = document.getElementById('input-expiry-time');
        const expError = document.getElementById('error-expiry-time');
        if (!formData.expiry_time) {
            this.showError(expInput, expError, 'Please enter the safe consumption cut-off time.');
            isValid = false;
        } else {
            const expiryDate = new Date(formData.expiry_time);
            const currentDate = new Date();

            if (expiryDate <= currentDate) {
                this.showError(expInput, expError, 'Expiry time must be in the future.');
                isValid = false;
            } else {
                this.clearError(expInput, expError);
            }
        }

        // 8. Validate Indian State
        const stateInput = document.getElementById('input-state');
        const stateError = document.getElementById('error-state');
        if (!formData.state || formData.state.trim() === '') {
            this.showError(stateInput, stateError, 'Please select an Indian state.');
            isValid = false;
        } else {
            this.clearError(stateInput, stateError);
        }

        // 9. Validate Pickup Location
        const locInput = document.getElementById('input-pickup-location');
        const locError = document.getElementById('error-pickup-location');
        if (!formData.pickup_location || formData.pickup_location.trim() === '') {
            this.showError(locInput, locError, 'Please provide the pickup address or landmark.');
            isValid = false;
        } else if (formData.pickup_location.trim().length < 5) {
            this.showError(locInput, locError, 'Pickup location is too short (min 5 characters).');
            isValid = false;
        } else {
            this.clearError(locInput, locError);
        }

        return isValid;
    }
};

// Make validator available globally
window.DonationValidator = DonationValidator;
