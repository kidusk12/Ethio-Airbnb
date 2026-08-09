# Ethio-Airbnb Backend

Express + PostgreSQL REST API for the Ethio-Airbnb project (FR-1 through FR-6 from the SRS).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your local Postgres credentials:
   ```bash
   cp .env.example .env
   ```

3. Create the database (adjust name/user to match your `.env`):
   ```bash
   createdb ethio_airbnb
   ```

4. Load the schema:
   ```bash
   psql -U postgres -d ethio_airbnb -f sql/schema.sql
   ```

5. Start the server:
   ```bash
   node server.js
   ```
   You should see: `Ethio-Airbnb backend running at http://localhost:4000`

## API overview

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register as guest or host |
| POST | `/api/auth/login` | — | Log in, returns a JWT |
| GET | `/api/listings` | — | Browse listings (supports `?city=`, `?minPrice=`, `?maxPrice=`) |
| GET | `/api/listings/:id` | — | View one listing |
| GET | `/api/listings/mine/all` | host | View your own listings |
| POST | `/api/listings` | host | Create a listing |
| PUT | `/api/listings/:id` | host | Edit your own listing |
| DELETE | `/api/listings/:id` | host | Delete your own listing |
| POST | `/api/bookings` | guest | Request a booking (rejects overlapping dates) |
| GET | `/api/bookings/mine` | guest | Your booking history |
| GET | `/api/bookings/host` | host | Bookings made on your listings |
| PATCH | `/api/bookings/:id/cancel` | guest | Cancel your own booking |
| GET | `/api/reviews/listing/:listingId` | — | Reviews for a listing |
| POST | `/api/reviews` | guest | Leave a rating + review |
| GET | `/api/admin/listings` | admin | View all listings |
| GET | `/api/admin/reviews` | admin | View all reviews |
| DELETE | `/api/admin/listings/:id` | admin | Remove a listing |
| DELETE | `/api/admin/reviews/:id` | admin | Remove a review |

## Auth

After login, include the token on protected routes:
```
Authorization: Bearer <token>
```

The `role` on your account (`guest`, `host`, `admin`) determines which routes you can use — set at registration (`admin` accounts should be created manually in the database for now, not via public registration).

## Notes for the team

- Passwords are hashed with bcrypt — never touch `password_hash` directly.
- Booking creation runs inside a database transaction (`BEGIN`/`COMMIT`/`ROLLBACK`) so overlapping-date requests can't create bad data even under concurrent requests.
- Payment is simulated — a booking is marked `confirmed` immediately, no real payment gateway is called (matches the SRS's out-of-scope decision).
- Listings have a `status` column (`pending`/`approved`/`rejected`) for future moderation use, but new listings default to `approved` for now — flip this later if the team wants a pre-approval gate.
