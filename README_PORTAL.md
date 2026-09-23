# Curiosity Travel Portal

This repository contains a Next.js + React + MongoDB Atlas portal matching the supplied Curiosity Travel admin UI direction.

Implemented now:
- Login/session authentication
- Admin/staff/agent role model
- Dashboard
- States, cities, meal plans, pickup/drop, hotels, daily cab rates, activities and special transfers
- Staff and agent account creation
- Hidden agent markup stored server-side
- Quotation builder and saved quotations
- Responsive UI based on supplied screenshots

## Setup
1. Copy `.env.example` to `.env.local`.
2. Put the real Atlas password into `MONGODB_URI`.
3. Set a long random `JWT_SECRET`.
4. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SETUP_KEY`.
5. Run `npm install` then `npm run dev`.
6. Initialize the admin once:
```bash
curl -X POST http://localhost:3000/api/setup -H "x-setup-key: YOUR_SETUP_KEY"
```

The supplied Atlas URL still contains `<db_password>`; live database connectivity cannot work until that value is configured in the environment. No passwords are committed to GitHub.

Next phase: richer monthly hotel pricing, image storage, itinerary templates/editor, PDF generation, and external supplier APIs.
