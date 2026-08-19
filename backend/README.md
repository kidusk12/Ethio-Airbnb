# Ethio-Airbnb Backend

Express + PostgreSQL REST API for the Ethio-Airbnb project — v3.2 contract.
Serves both the Flutter mobile app and the web frontend from identical endpoints (no platform branching).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your local Postgres credentials:
   ```bash
   cp .env.example .env
   ```

3. Create the database:
   ```bash
   createdb ethio_airbnb
   ```

4. Load the schema (re-runnable — drops and recreates all tables):
   ```bash
   psql -U postgres -d ethio_airbnb -f sql/schema.sql
   ```

5. Start the server:
   ```bash
   node server.js
   ```
   You should see: `Ethio-Airbnb backend running at http://localhost:4000`

6. Run tests:
   ```bash
   npm test
   ```

---

## API Reference (v3.2)

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register as `guest` or `host` |
| POST | `/api/auth/login` | — | Log in, returns a JWT |
| POST | `/api/auth/logout` | — | Stateless logout (discard token client-side) |
| GET  | `/api/auth/me` | any | Returns the authenticated user's profile |

### Listings *(implemented by listings dev)*
| Method | Route | Auth | Description |
|---|---|---|---|
| GET    | `/api/listings` | — | Browse approved listings |
| GET    | `/api/listings/:id` | — | View one listing |
| GET    | `/api/listings/mine/all` | host | View host's own listings |
| POST   | `/api/listings` | host | Create a listing (starts `pending`) |
| PUT    | `/api/listings/:id` | host | Edit own listing |
| DELETE | `/api/listings/:id` | host | Delete own listing |

### Bookings
| Method | Route | Auth | Description |
|---|---|---|---|
| GET  | `/api/bookings/availability` | — | Check availability for a listing + date range |
| GET  | `/api/bookings/my-bookings` | guest | Guest's booking history with `hasReviewed` |
| GET  | `/api/bookings/host-bookings` | host | Bookings on the host's listings |
| POST | `/api/bookings` | guest | Create a booking — returns `paymentDeadline` |
| POST | `/api/bookings/:id/payment-receipt` | guest | Submit receipt URL (new row on resubmission) |
| GET  | `/api/bookings/:id/payment-status` | guest | Latest payment row status |
| POST | `/api/bookings/:id/cancel` | guest | Cancel (24 h window after confirmation) |

### Reviews *(implemented by listings/reviews dev)*
| Method | Route | Auth | Description |
|---|---|---|---|
| GET  | `/api/reviews/listing/:listingId` | — | Reviews for a listing |
| POST | `/api/reviews` | guest | Leave a review (one per booking) |

### Admin
| Method | Route | Auth | Description |
|---|---|---|---|
| GET    | `/api/admin/listings/pending` | admin | Pending listings with host + deed docs |
| POST   | `/api/admin/listings/:id/approve` | admin | Approve a listing |
| POST   | `/api/admin/listings/:id/reject` | admin | Reject a listing (optional reason) |
| GET    | `/api/admin/listings` | admin | All listings (any status) |
| DELETE | `/api/admin/listings/:id` | admin | Soft-delete a listing |
| GET    | `/api/admin/payments/pending` | admin | Pending payment receipts to review |
| POST   | `/api/admin/payments/:id/confirm` | admin | Confirm payment → creates payout + audit log |
| POST   | `/api/admin/payments/:id/reject` | admin | Reject payment → cancels booking |
| GET    | `/api/admin/payouts/due` | admin | Unpaid host payouts |
| POST   | `/api/admin/payouts/:id/mark-paid` | admin | Mark payout paid → audit log |
| GET    | `/api/admin/transactions` | admin | Full audit log, newest first |
| GET    | `/api/admin/reviews` | admin | All reviews |
| DELETE | `/api/admin/reviews/:id` | admin | Hard-delete a review |

---

## Auth

After login, include the JWT on protected routes:
```
Authorization: Bearer <token>
```

`role` is set at registration (`guest` or `host`). Admin accounts must be created directly in the database — they cannot self-register.

---

## Architecture Notes

- **Passwords** — hashed with bcrypt; `password_hash` is never returned to clients.
- **Booking creation** — overlap check + INSERT run inside a single `BEGIN`/`COMMIT` transaction with `SELECT ... FOR UPDATE` locking to prevent concurrent double-booking.
- **Expiry** — `pending_payment` bookings past their `payment_deadline` are lazily expired to `cancelled` on first read (booking creation, availability check, my-bookings, host-bookings, payment-status, admin payments). Both the booking and its most recent payment row are flipped atomically.
- **Payment resubmission** — submitting a receipt always creates a new `payments` row; the most recent row (by `created_at DESC`) is the active one. This allows guests to resubmit after rejection without losing history.
- **Commission** — admin keeps 15%, host receives 85% (`COMMISSION_RATE = 0.15` in `routes/admin.js`). Change it in one place.
- **Transaction log** — `transactions` table is append-only; no UPDATE or DELETE is ever issued against it.
- **No platform branching** — all endpoints behave identically for mobile and web clients.
