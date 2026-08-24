# FOODBRIDGE REST API CONTRACT
**Teammate Java Backend Specification & Interface Agreement**

This document establishes the decoupled API contract between the **Frontend (Student Responsibility)** and the **Java REST Backend (Teammate Responsibility)**.

---

## Base URL
```
http://localhost:8080/api
```

---

## 1. Donations API

### 1.1 List Donations (With Filtering & Sorting)
- **Endpoint**: `GET /api/donations`
- **Query Parameters**:
  - `status` (string, optional): `AVAILABLE`, `ACCEPTED`, `PICKUP_SCHEDULED`, `COMPLETED`, `EXPIRED`, `CANCELLED`
  - `donor_id` (int, optional)
  - `ngo_id` (int, optional)
  - `state` (string, optional)
  - `city` (string, optional)
  - `dietary_type` (string, optional): `VEGETARIAN`, `VEGAN`, `NON_VEGETARIAN`, `JAIN`, `EGG`
  - `category_id` (int, optional)
  - `search` (string, optional)
  - `sortByUrgency` (boolean, optional, default `true`)

- **Response (200 OK)**:
```json
[
  {
    "donation_id": 101,
    "donor_id": 1,
    "donor_name": "Sri Krishna Grand Restaurant",
    "donor_type": "RESTAURANT",
    "food_name": "Vegetable Pulao & Mix Dal",
    "dietary_type": "VEGETARIAN",
    "category_id": 1,
    "category_name": "Cooked Food",
    "cuisine": "INDIAN",
    "quantity": 35,
    "unit": "PORTIONS",
    "prepared_at": "2026-08-23T22:00:00Z",
    "best_before": "2026-08-24T01:30:00Z",
    "storage_condition": "HEATED",
    "description": "Freshly prepared aromatic basmati pulao.",
    "location_id": 1,
    "state": "Andhra Pradesh",
    "city": "Vijayawada",
    "locality": "Gandhinagar",
    "status": "AVAILABLE",
    "claiming_ngo_name": null,
    "created_at": "2026-08-23T22:00:00Z"
  }
]
```

---

### 1.2 Get Donation by ID
- **Endpoint**: `GET /api/donations/{id}`
- **Response (200 OK)**: Single Hydrated Donation Object
- **Response (404 Not Found)**: `{ "error": "Donation not found" }`

---

### 1.3 Create Donation
- **Endpoint**: `POST /api/donations`
- **Request Body**:
```json
{
  "donor_id": 1,
  "food_name": "Hyderabadi Veg Biryani",
  "dietary_type": "VEGETARIAN",
  "category_id": 1,
  "cuisine": "INDIAN",
  "quantity": 25,
  "unit": "PORTIONS",
  "best_before": "2026-08-24T04:00:00Z",
  "storage_condition": "HEATED",
  "description": "Surplus dum biryani with salan.",
  "state": "Andhra Pradesh",
  "city": "Vijayawada",
  "locality": "Benz Circle"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "donation_id": 108,
  "message": "Donation registered successfully."
}
```

---

### 1.4 Accept Donation (Atomic Concurrency Protected)
- **Endpoint**: `POST /api/donations/{id}/accept`
- **Request Body**:
```json
{
  "ngo_id": 1
}
```
- **Response (200 OK - Success)**:
```json
{
  "success": true,
  "message": "Donation #101 accepted successfully!"
}
```
- **Response (409 Conflict - Already Claimed / Expired)**:
```json
{
  "success": false,
  "message": "This donation is no longer available (already claimed by another organization)."
}
```

---

### 1.5 Cancel Donation
- **Endpoint**: `POST /api/donations/{id}/cancel`
- **Response (200 OK)**: `{ "success": true, "message": "Donation cancelled." }`

---

## 2. Pickups API

### 2.1 Schedule Pickup
- **Endpoint**: `POST /api/pickups`
- **Request Body**:
```json
{
  "donation_id": 104,
  "ngo_id": 1,
  "pickup_date": "2026-08-24",
  "pickup_time": "19:30",
  "contact_person": "Volunteer Priya",
  "contact_phone": "+91 94400 11223",
  "vehicle_type": "Four-Wheeler Van (Insulated)",
  "notes": "Gate 2 entrance"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "pickup_id": 203,
  "message": "Pickup scheduled successfully."
}
```

---

### 2.2 Complete Collection
- **Endpoint**: `POST /api/pickups/{id}/complete`
- **Request Body**:
```json
{
  "donation_id": 104
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Food rescue successfully marked as completed!"
}
```

---

## 3. Metrics & Dashboard Stats API

### 3.1 Donor Live Dashboard Stats
- **Endpoint**: `GET /api/donors/{id}/stats`
- **Response (200 OK)**:
```json
{
  "active_donations": 2,
  "accepted_donations": 1,
  "pickup_scheduled": 1,
  "completed_donations": 4,
  "expired_donations": 1,
  "total_servings_donated": 120
}
```

### 3.2 NGO Live Dashboard Stats
- **Endpoint**: `GET /api/ngos/{id}/stats`
- **Response (200 OK)**:
```json
{
  "available_in_platform": 3,
  "pending_pickup": 1,
  "scheduled_pickups": 1,
  "completed_rescues": 5,
  "meals_rescued": 165
}
```
