# Campus Food Ordering System
### Design and Development of a Food Ordering App for Campus: A Case Study of The Polytechnic Ibadan

A full-stack, role-based web application that lets students, staff, food vendors, and
administrators at The Polytechnic Ibadan order, sell, and manage campus food digitally.

---

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, plain CSS (custom design system) |
| Backend | Node.js, Express.js, REST API |
| Database | MySQL (via `mysql2`) |
| Auth | JWT + BCrypt + Role-Based Access Control |
| File Uploads | Multer (local disk in dev — see note in §7) |
| Deployment target | Vercel (frontend + backend as two projects) |

---

## 2. Project Structure

```
food-ordering-app/
├── client/           # React + Vite frontend
├── server/           # Express REST API
├── database/
│   ├── schema.sql        # Full table definitions
│   └── sample-data.sql   # Demo vendors, foods, and accounts
├── .env.example      # All environment variables in one place
├── README.md
└── README-VERCEL.md  # Step-by-step Vercel deployment guide
```

---

## 3. User Roles

- **Customer** — browses vendors/food, places orders, tracks status, pays their way.
- **Vendor** — manages categories, menu items, incoming orders, and sales reports. Requires admin approval before going live.
- **Administrator** — approves/suspends vendors, manages customers, monitors all orders and transactions, generates reports, and reviews the activity log.

---

## 4. Local Setup

### 4.1 Prerequisites
- Node.js 18+
- A MySQL server (local install, XAMPP/WAMP, or a free hosted instance)

### 4.2 Database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/sample-data.sql   # optional demo data
```

### 4.3 Backend
```bash
cd server
npm install
cp ../.env.example .env     # then edit .env with your DB credentials
npm run dev                 # starts on http://localhost:5000
```

To create just an administrator account (no demo data), run instead:
```bash
npm run seed
```

### 4.4 Frontend
```bash
cd client
npm install
cp ../.env.example .env      # keep only the VITE_ variables
npm run dev                  # starts on http://localhost:5173
```

Visit **http://localhost:5173**.

---

## 5. Sample Accounts (from `database/sample-data.sql`)

All sample accounts share the password: **`Password123!`**

| Role | Email |
|---|---|
| Admin | admin@tpi.edu.ng |
| Vendor (Campus Bites) | campusbites@tpi.edu.ng |
| Vendor (Poly Kitchen) | polykitchen@tpi.edu.ng |
| Vendor (Student Cafe) | studentcafe@tpi.edu.ng |
| Customer | tobi.student@tpi.edu.ng |
| Customer | chidinma.student@tpi.edu.ng |

**Change these passwords before any real/public deployment.**

---

## 6. Database Tables

| Table | Purpose |
|---|---|
| `users` | All accounts (customer, vendor, admin) with hashed passwords |
| `vendors` | Vendor business profiles and approval status |
| `categories` | Per-vendor food categories |
| `foods` | Menu items, priced in Naira |
| `orders` | Order header: number, totals, payment/order status |
| `order_items` | Line items per order |
| `payments` | Payment record per order (method, reference, status) |
| `notifications` | In-app notifications per user |
| `activity_logs` | Audit trail of key platform actions |

---

## 7. Security Notes

- Passwords are hashed with BCrypt — never stored in plain text.
- Authentication uses JWT; authorization uses role-based middleware (`customerOnly`, `vendorOnly`, `adminOnly`).
- All SQL queries are parameterized (`mysql2`) — no string-built SQL.
- Login/registration routes are rate-limited to slow brute-force attempts.
- The error handler never returns stack traces, SQL errors, or secrets to the client.
- Uploaded images are validated to JPG/JPEG/PNG/WEBP only.
- **Image storage**: for the academic demo, uploaded images are written to `server/uploads` and served statically. This will **not** persist on Vercel (its filesystem is ephemeral). See `server/utils/upload.js` for the swap-in point for an external provider (Cloudinary, S3, etc.) before a real production launch.

---

## 8. API Overview

All routes are prefixed with `/api`. Full route files live in `server/routes/`.

| Base path | Covers |
|---|---|
| `/auth` | Register (customer/vendor), login, profile, change password |
| `/vendors` | Public vendor listing/profile, vendor self-service, admin approval |
| `/categories` | Vendor category CRUD |
| `/foods` | Public browsing/search, vendor food CRUD |
| `/orders` | Checkout, order history, status workflow, sales report, admin monitoring |
| `/notifications` | List, unread count, mark as read |
| `/admin` | Dashboard stats, customer management, transactions, reports, activity log |

---

## 9. Testing Checklist

See the full workflow tests exercised during development:
- Registration (customer & vendor) with duplicate-email and validation checks
- Login (valid/invalid/suspended/pending-vendor)
- Single-vendor cart restriction
- Full order lifecycle: pending → accepted → preparing → ready → completed, and cancellation
- Notifications generated at every step above
- Vendor approval → category → food → visible on public menu
- Admin dashboard, vendor approvals, customer suspension, order monitoring, reports, activity log
- Mobile responsiveness at common breakpoints

---

## 10. Deployment

See **[README-VERCEL.md](./README-VERCEL.md)** for the full step-by-step guide to deploying the
frontend and backend on Vercel with a hosted MySQL database.
