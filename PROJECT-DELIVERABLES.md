# Project Deliverables & Defense Notes

## 1. Full Module List

**Customer:** Registration · Login · Dashboard · Vendor Browsing · Food Menu & Search/Filter ·
Shopping Cart (single-vendor) · Checkout · Payment (Pickup / Bank Transfer / Paystack-ready) ·
Order Tracking · Order History · Notifications · Profile & Password Change

**Vendor:** Registration (pending approval) · Login (status-aware) · Dashboard · Category
Management · Food Management (with image upload) · Order Management (status workflow) · Sales
Report (today/week/month/all-time, printable) · Business Profile & Logo · Account Settings

**Administrator:** Dashboard (platform-wide stats) · Vendor Approval (approve/reject/suspend/
reactivate) · Customer Management (search, suspend/activate) · Order Monitoring (multi-filter) ·
Transaction Ledger · Reports (9 report types, printable) · Activity Log · Account Settings

## 2. Database Tables (see README.md §6 for full field list)
`users`, `vendors`, `categories`, `foods`, `orders`, `order_items`, `payments`, `notifications`,
`activity_logs` — all normalized with primary/foreign keys, a unique email constraint, and
indexes on frequently filtered columns (role, status, approval_status, order_status).

## 3. Security Documentation (see README.md §7 for the full list)
BCrypt password hashing · JWT authentication · role-based authorization middleware ·
parameterized queries (SQL-injection safe) · rate-limited auth routes · centralized error
handling that never leaks stack traces or secrets · validated image uploads.

## 4. API Route Documentation
See README.md §8 for the base paths, and `server/routes/*.js` for the exact route list — every
route file is short and self-documents its own endpoints via `router.get/post/put/delete` calls.

## 5. Sample Accounts & Initial Admin Setup
See README.md §5 for the full sample account table (password `Password123!` for all).
To create *only* an administrator account (e.g. for a clean production database with no demo
data), run:
```bash
cd server
npm run seed
```
This reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` from `.env` if present, otherwise uses
sensible defaults printed to the console after it runs.

## 6. Suggested Screens to Capture for Chapter Four
1. Landing page (hero + featured vendors/meals)
2. Customer registration page
3. Login page
4. Customer dashboard
5. Browse Food page with search/filter applied
6. A vendor's public menu page
7. Shopping cart with items added
8. Checkout page with payment method selection
9. Order confirmation screen with generated order number
10. Order tracking / progress indicator (customer view)
11. Customer order history table
12. Customer notifications page
13. Vendor registration page
14. Vendor dashboard (stats + recent orders)
15. Vendor category management
16. Vendor food management (add/edit food modal)
17. Vendor incoming orders with status filter
18. Vendor sales report
19. Admin dashboard (platform stats)
20. Admin vendor approvals page (pending → approved)
21. Admin customer management
22. Admin order monitoring with filters
23. Admin transactions table
24. Admin reports page (any generated report)
25. Admin activity log
26. A mobile-width screenshot of any two screens above (for the responsiveness section)

## 7. ZIP Contents
The delivered ZIP contains the complete `client/`, `server/`, and `database/` folders, both
README files, `.env.example`, and this deliverables document — ready to unzip, configure, and run.
