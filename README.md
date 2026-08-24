# 🍲 FoodBridge — India's Premier Surplus Food Rescue Platform

**FoodBridge** is a modern, responsive food rescue web application connecting food donors (restaurants, hotels, banquet halls, caterers, and households) with verified NGOs across Indian states to eliminate food waste and nourish hungry communities.

---

## 🚀 1. Tech Stack Overview

- **Frontend**: Pure Semantic HTML5, Vanilla CSS3 (Custom Responsive Design System), Vanilla JavaScript (ES6+).
- **Backend**: Node.js & Express.js (`server.js`, `db.js`, `routes/`, `controllers/`).
- **Database**: MySQL Relational Database (Normalized schema with `users`, `donations`, and `pickups` tables).
- **Authentication**: Beginner-friendly session management with role-based profiles (Donor vs NGO).
- **Architecture**: Modular REST API with async/await.

---

## 📁 2. Project Folder Structure

```
foodbridge/
├── backend/
│   ├── controllers/
│   │   └── donationController.js  # Business logic, Auth, & SQL queries
│   ├── routes/
│   │   └── donationRoutes.js      # Express REST API & Auth routes
│   ├── db.js                      # MySQL2 connection pool with smart fallback
│   └── server.js                  # Express server entry point & static server
├── database/
│   ├── schema.sql                 # MySQL Table creation (users, donations, pickups)
│   └── sample_data.sql            # Seed records across Indian states
├── public/
│   ├── assets/
│   │   └── images/
│   │       ├── hero.jpg           # Hero section visual banner
│   │       ├── delivery.jpg       # NGO community distribution illustration
│   │       └── donor_kitchen.jpg  # Commercial donor kitchen packaging
│   ├── css/
│   │   └── style.css              # Custom CSS design system & responsive rules
│   ├── js/
│   │   ├── validation.js          # Client-side form validation module
│   │   └── main.js                # Auth, state management, fetch() API calls & DOM
│   └── index.html                 # Complete UI (Landing, Donor & NGO portals, Auth modal)
├── package.json                   # Dependencies (express, cors, mysql2, dotenv)
├── test_suite.js                  # Automated API, Auth, & lifecycle test runner
└── README.md                      # Documentation
```

---

## 🔑 3. Demo Login Accounts

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Donor** | `donor@annapurna.in` | `password123` | Annapurna Grand Restaurant (Andhra Pradesh) |
| **NGO** | `ngo@seva.org` | `password123` | Seva Food Rescue Foundation (Andhra Pradesh) |
| **Instant Demo** | Click the `⚡ Quick Login` buttons inside the login popup |

---

## 🌐 4. REST API Documentation

| Method | Endpoint | Description | Sample Payload |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | User login | `{ email, password }` |
| **POST** | `/api/auth/signup` | Register new user | `{ name, role, state, email, password }` |
| **GET** | `/api/donations` | Fetch donations (optional filters) | `?state=Telangana&status=AVAILABLE` |
| **GET** | `/api/stats` | Aggregate dashboard metrics | N/A |
| **POST** | `/api/donations` | Create food donation | `{ food_name, food_type, category, quantity, unit, ... }` |
| **PUT** | `/api/donations/:id/accept` | NGO accepts donation | `{ ngo_id }` |
| **PUT** | `/api/donations/:id/pickup` | Volunteer marks picked up | N/A |
| **PUT** | `/api/donations/:id/deliver` | NGO marks delivered | N/A |

---

## 🔄 5. Food Donation Lifecycle

```
[AVAILABLE] ────────► [ACCEPTED] ────────► [PICKED UP] ────────► [DELIVERED]
  (Donor lists          (NGO claims          (Volunteer collects    (Distributed
   surplus food)         donation)            from restaurant)       to shelter)
```

