# Kisan Netra 🌾

A full-stack MERN application that helps farmers track licensed pesticide and fertilizer inventory, monitor remaining stock, and locate nearby dealers in real time — combining inventory management, regulatory trust signals, and geospatial search in one platform.


---

## Features

- **JWT authentication with role-based access control** (Farmer / Dealer / Admin)
- **OTP-based password reset** via email (Nodemailer + Mailtrap), with hashed OTPs and rate-limited attempts
- **Dealer store profiles** with geolocation picked via an interactive Leaflet map (Geolocation API + draggable pin)
- **Dealer-managed product catalog and stock listings** — dealers add products and quantities themselves
- **Farmer inventory tracking** with usage logging and auto-decrementing stock
- **Low-stock and expiry alerts**, computed on-request rather than via a background job
- **Geospatial "nearby dealers" search** using MongoDB's `2dsphere` index and `$geoNear` aggregation, returning real distance in km, optionally filtered by product
- **Self-declared + admin-verified dealer trust model** — dealers submit a license number, admins approve via a dedicated panel (no public government API exists for real-time verification, so this mirrors how real agritech platforms handle it)
- **Automated tests** (Jest + Supertest) covering the auth flow and geospatial search edge cases

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (Mongoose), 2dsphere geospatial indexing |
| Auth | JWT (httpOnly cookies), bcrypt |
| Maps | Leaflet.js + OpenStreetMap |
| Email | Nodemailer (Mailtrap for dev) |
| Testing | Jest, Supertest |
| Deployment | Render (API), Vercel (client) |

---

## Architecture Notes

A few design decisions worth calling out:

- **Dealer / Product / DealerStock is a proper many-to-many join**, not embedded arrays — a dealer can stock many products, a product can be stocked by many dealers. This makes cross-dealer product search straightforward at the cost of an extra collection.
- **Geo queries use `$geoNear` aggregation, not a plain `$near` find()** — this returns an actual `distance` field per result, which a plain `find()` with `$near` cannot.
- **OTPs are bcrypt-hashed before storage**, same as passwords — never stored in plaintext, capped at 5 attempts to prevent brute-forcing.
- **CORS + cookies are configured differently per environment**: `sameSite: 'lax'` locally (frontend/backend share `localhost`), `sameSite: 'none'` + `secure: true` in production (Vercel and Render are different domains, which cross-site cookies require).

---

## Local Setup

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free tier is fine)
- A Mailtrap account (free, for local email testing)

### Backend

```bash
cd server
npm install
cp .env.example .env   # then fill in your own values
npm run seed            # creates an admin account + starter product catalog
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

The client runs at `http://localhost:5173`, the API at `http://localhost:5000`.

### Running Tests

```bash
cd server
npm test
```

Tests run against a separate database (derived from your `MONGO_URI`) so they never touch your real data.

---

## Environment Variables

See `server/.env.example` for the full list. Key ones:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Signing secret for auth tokens |
| `CLIENT_URL` | Frontend origin, used for CORS |
| `SMTP_*` | Mailtrap (or production SMTP) credentials |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Credentials for the seeded admin account (never hardcoded in the seed script itself) |

---

## License

Built as a personal portfolio project.
