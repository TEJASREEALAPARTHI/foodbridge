# FOODBRIDGE: TCS DIGITAL TECHNICAL INTERVIEW PREPARATION GUIDE

This guide is prepared specifically for a college student explaining the **FoodBridge** project during a technical interview.

---

## 1. PROJECT ELEVATOR PITCH (30-Second Summary)
> "FoodBridge is a full-stack smart food rescue platform connecting hotels, canteens, and banquet halls with local NGOs and community shelters. It solves urban food waste through an expiry-prioritized discovery system. In our team project, I designed the normalized 3NF MySQL database schema, built the accessible UI with Vanilla HTML/CSS, implemented form validation and cascading location filters in JavaScript, and connected our frontend to our REST API using standard `fetch()` asynchronous requests."

---

## 2. TEAM RESPONSIBILITIES (Honest & Confident Boundary)

| Student's Responsibility (YOU) | Teammate's Responsibility |
| :--- | :--- |
| **Frontend UI/UX**: Semantic HTML5, CSS design system, responsive layouts | **Java REST Backend**: Spring Boot / Java Servlets |
| **Client Logic**: Vanilla JavaScript DOM manipulation, event listeners, dynamic cascading dropdowns | **Server-side Routing & Endpoints**: Request controllers & service logic |
| **Form Validation**: Sanitization, positive integers, future timestamp verification | **JDBC / Database Connection Pooling**: DataSource management & queries |
| **Data Flow**: `fetch()` API integration, JSON parsing, rendering dynamic components | **Backend Validation & Security**: Server-side error handling & HTTP status codes |
| **Database Design**: 3NF Normalized schema, Foreign Keys, Indexes, SQL queries | **Server Deployment**: Running the Java process & configuring ports |

---

## 3. CORE TECHNICAL INTERVIEW QUESTIONS & ANSWERS

### Q1: How did you ensure data consistency across multiple dashboards? (Single Source of Truth)
**Student Answer**:
> "We avoided holding independent or disconnected copies of donation state in different UI components. The database serves as the single source of truth. Whenever an action takes place—such as an NGO accepting a donation—the frontend sends a `POST` request to the backend. The backend updates `status = 'ACCEPTED'` in MySQL. Once the backend returns success, the frontend re-fetches the latest data and re-renders the dashboard counts and listings. This guarantees that an accepted donation immediately disappears from 'Available Food' and appears as 'Accepted' on both the Donor and NGO dashboards without any state contradiction."

---

### Q2: Why is your database normalized into 3rd Normal Form (3NF)?
**Student Answer**:
> "In a food rescue system, address details and food categories repeat frequently. If we stored state, city, and locality strings directly inside each donation record, updating an address would cause update anomalies and waste disk storage. We created a dedicated `locations` table and a `food_categories` lookup table referenced via foreign keys (`location_id`, `category_id`). This ensures every non-key attribute depends strictly on the primary key, achieving 3NF."

---

### Q3: How did you prevent race conditions (two NGOs accepting the same food simultaneously)?
**Student Answer**:
> "We enforced protection at two levels:
> 1. **Client-side UX**: When the NGO clicks 'Accept Donation', the button state immediately switches to 'Accepting...' and is disabled to prevent rapid duplicate clicks.
> 2. **Database Atomic Update**: In SQL, the backend executes an atomic update query with a conditional guard:
> ```sql
> UPDATE donations 
> SET status = 'ACCEPTED', ngo_id = ? 
> WHERE donation_id = ? AND status = 'AVAILABLE' AND best_before > NOW();
> ```
> If another NGO claimed it milliseconds earlier, the `WHERE status = 'AVAILABLE'` condition matches zero rows. The backend detects this and returns an HTTP 409 Conflict with the message *'This donation is no longer available.'*"

---

### Q4: Why did you use a PriorityQueue in the Java model for food donations?
**Student Answer**:
> "Surplus food is highly time-sensitive. Food that expires in 30 minutes must be claimed before food that expires tomorrow. In Java, we implemented `FoodPriorityQueue` using a min-heap `PriorityQueue<Donation>` with a custom `Comparator`:
> ```java
> Comparator<Donation> EXPIRY_CMP = (d1, d2) -> d1.getBestBefore().compareTo(d2.getBestBefore());
> ```
> This allows the system to poll the most urgent item in $O(1)$ constant time and sort incoming listings in $O(N \log N)$ time."

---

### Q5: Why shouldn't JavaScript connect directly to MySQL?
**Student Answer**:
> "Connecting JavaScript running in the browser directly to MySQL is a severe security vulnerability because database credentials (host, username, password) would be exposed in the browser's source code and network inspector. Furthermore, client-side SQL queries could be tampered with. An intermediate Java REST API layer ensures secure authentication, centralized validation, and server-controlled database access."

---

### Q6: How do cascading dropdowns work in your JavaScript implementation?
**Student Answer**:
> "We attached a `change` event listener to the State `<select>` element. When the user selects a state (e.g., 'Andhra Pradesh'), the event handler queries our normalized location dictionary for matching cities (`Vijayawada`, `Guntur`, `Visakhapatnam`). It resets the City select element, enables it, and iterates over the array using `document.createElement('option')` to append the new choices dynamically."

---

## 4. SQL QUERY FLASHCARDS FOR INTERVIEWERS

```sql
-- 1. Multi-Table JOIN Query for NGO Find Food
SELECT d.donation_id, d.food_name, d.quantity, fc.category_name, l.city, l.locality
FROM donations d
JOIN donors dn ON d.donor_id = dn.donor_id
JOIN food_categories fc ON d.category_id = fc.category_id
JOIN locations l ON d.location_id = l.location_id
WHERE d.status = 'AVAILABLE' AND d.best_before > NOW()
ORDER BY d.best_before ASC;

-- 2. Aggregated Live Stats Query for Donor Dashboard
SELECT 
    COUNT(CASE WHEN status = 'AVAILABLE' THEN 1 END) AS active_count,
    COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) AS accepted_count,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) AS completed_count,
    SUM(CASE WHEN status = 'COMPLETED' THEN quantity ELSE 0 END) AS total_portions
FROM donations
WHERE donor_id = ?;
```
