# Ethio-Airbnb API Contract

**Base URL:** `/api`
**Format:** JSON
**Authentication:** Bearer JWT token, sent as `Authorization: Bearer <token>`

---

## Standard Response Formats

### Success

```json
{
  "success": true,
  "message": "Optional human-readable message",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Explanation of what went wrong",
  "errors": [
    { "field": "email", "message": "Email is already registered" }
  ]
}
```

`errors` is optional and only present for validation failures (e.g. bad form input). For non-validation errors (auth, not found, server errors), `errors` can be omitted.

---

## HTTP Status Codes

| Code | Meaning | When |
|---|---|---|
| 200 | OK | Successful GET/PUT/DELETE |
| 201 | Created | Successful POST that creates a resource |
| 400 | Bad Request | Missing/invalid fields, failed validation |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token, but wrong role or not the resource owner |
| 404 | Not Found | Resource (listing, booking, etc.) doesn't exist |
| 409 | Conflict | Overlapping booking dates, duplicate email on register |
| 500 | Internal Server Error | Unexpected server/database error |

---

## Authentication — `/api/auth`

### `POST /api/auth/register`
**Auth:** No

Request:
```json
{
  "name": "Kidus Kidanewold",
  "email": "kidus@example.com",
  "password": "plaintext-min-8-chars",
  "role": "guest"
}
```
`role` is `"guest"` or `"host"`.

Response `201`:
```json
{
  "success": true,
  "message": "Account created",
  "data": {
    "user": { "id": "uuid", "name": "Kidus Kidanewold", "email": "kidus@example.com", "role": "guest" },
    "token": "jwt-token-string"
  }
}
```

Errors: `400` (validation), `409` (email already registered)

---

### `POST /api/auth/login`
**Auth:** No

Request:
```json
{ "email": "kidus@example.com", "password": "plaintext-min-8-chars" }
```

Response `200`:
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "Kidus Kidanewold", "email": "kidus@example.com", "role": "guest" },
    "token": "jwt-token-string"
  }
}
```

Errors: `400` (missing fields), `401` (wrong email/password)

---

### `GET /api/auth/me`
**Auth:** Yes

Response `200`:
```json
{
  "success": true,
  "data": { "id": "uuid", "name": "Kidus Kidanewold", "email": "kidus@example.com", "role": "guest" }
}
```

Errors: `401` (missing/invalid token)

---

## Listings — `/api/listings`

### `GET /api/listings`
**Auth:** No

Query parameters (all optional):

| Param | Type | Example | Notes |
|---|---|---|---|
| `location` | string | `Addis Ababa` | Partial match |
| `minPrice` | number | `500` | Per night |
| `maxPrice` | number | `2000` | Per night |
| `checkIn` | date (`YYYY-MM-DD`) | `2026-09-01` | Used with `checkOut` to exclude booked listings |
| `checkOut` | date (`YYYY-MM-DD`) | `2026-09-05` | |
| `page` | number | `1` | Default `1` |
| `limit` | number | `20` | Default `20`, max `50` |

Response `200`:
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "uuid",
        "title": "Cozy apartment near Bole",
        "location": "Addis Ababa",
        "pricePerNight": 1200,
        "coverPhoto": "https://.../photo.jpg",
        "hostId": "uuid"
      }
    ],
    "page": 1,
    "totalPages": 4,
    "totalResults": 78
  }
}
```

---

### `GET /api/listings/:id`
**Auth:** No

Response `200`:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Cozy apartment near Bole",
    "description": "2-bedroom apartment, 5 min from airport",
    "location": "Addis Ababa",
    "pricePerNight": 1200,
    "photos": ["https://.../1.jpg", "https://.../2.jpg"],
    "hostId": "uuid",
    "hostName": "Melat Worku",
    "averageRating": 4.5,
    "reviewCount": 12
  }
}
```

Errors: `404` (listing not found)

---

### `POST /api/listings`
**Auth:** Host only

Request:
```json
{
  "title": "Cozy apartment near Bole",
  "description": "2-bedroom apartment, 5 min from airport",
  "location": "Addis Ababa",
  "pricePerNight": 1200,
  "photos": ["https://.../1.jpg", "https://.../2.jpg"]
}
```

Response `201`:
```json
{ "success": true, "message": "Listing created", "data": { "id": "uuid" } }
```

Errors: `400` (validation), `401`, `403` (not a host)

---

### `PUT /api/listings/:id`
**Auth:** Listing owner only

Request: same shape as `POST`, any subset of fields.

Response `200`:
```json
{ "success": true, "message": "Listing updated" }
```

Errors: `400`, `401`, `403` (not the owner), `404`

---

### `DELETE /api/listings/:id`
**Auth:** Listing owner only

Response `200`:
```json
{ "success": true, "message": "Listing deleted" }
```

Errors: `401`, `403`, `404`

---

### `GET /api/listings/my-listings`
**Auth:** Host only

Response `200`:
```json
{
  "success": true,
  "data": {
    "listings": [
      { "id": "uuid", "title": "Cozy apartment near Bole", "pricePerNight": 1200, "active": true }
    ]
  }
}
```

---

## Bookings — `/api/bookings`

### `GET /api/bookings/availability`
**Auth:** No

Query parameters:

| Param | Type | Required |
|---|---|---|
| `listingId` | uuid | Yes |
| `checkIn` | date | Yes |
| `checkOut` | date | Yes |

Response `200`:
```json
{ "success": true, "data": { "available": true } }
```

---

### `POST /api/bookings`
**Auth:** Guest only

Request:
```json
{
  "listingId": "uuid",
  "checkIn": "2026-09-01",
  "checkOut": "2026-09-05"
}
```

Response `201`:
```json
{
  "success": true,
  "message": "Booking created, pending payment",
  "data": { "bookingId": "uuid", "totalPrice": 4800, "status": "pending_payment" }
}
```

Errors: `400` (invalid dates), `401`, `403` (not a guest), `404` (listing not found), `409` (dates overlap an existing booking)

---

### `POST /api/bookings/:id/payment`
**Auth:** Guest, must own the booking

Simulated payment confirmation — no real payment gateway.

Request:
```json
{ "paymentMethod": "mock" }
```

Response `200`:
```json
{
  "success": true,
  "message": "Payment confirmed, booking is now confirmed",
  "data": { "bookingId": "uuid", "status": "confirmed" }
}
```

Errors: `401`, `403` (not the booking's guest), `404`

---

### `GET /api/bookings/my-bookings`
**Auth:** Guest only

Response `200`:
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "listingId": "uuid",
        "listingTitle": "Cozy apartment near Bole",
        "checkIn": "2026-09-01",
        "checkOut": "2026-09-05",
        "status": "confirmed",
        "totalPrice": 4800
      }
    ]
  }
}
```

---

### `GET /api/bookings/host-bookings`
**Auth:** Host only

Response `200`: same shape as `my-bookings`, but scoped to bookings made on the host's own listings, and includes `guestName`.

---

## Reviews — `/api/reviews`

### `GET /api/reviews/listing/:listingId`
**Auth:** No

Response `200`:
```json
{
  "success": true,
  "data": {
    "reviews": [
      { "id": "uuid", "guestName": "Kidus K.", "rating": 5, "text": "Great stay!", "createdAt": "2026-08-01" }
    ],
    "averageRating": 4.5
  }
}
```

---

### `POST /api/reviews/listing/:listingId`
**Auth:** Guest only, must have a completed booking on this listing

Request:
```json
{ "rating": 5, "text": "Great stay, very clean and close to everything." }
```

Response `201`:
```json
{ "success": true, "message": "Review submitted", "data": { "id": "uuid" } }
```

Errors: `400` (rating out of 1–5 range), `401`, `403` (no completed booking on this listing, or already reviewed it), `404`

---

## Admin — `/api/admin`

All endpoints require `Auth: Yes` and the `ADMIN` role.

### `GET /api/admin/listings`

Returns all listings on the platform (active and flagged), for moderation.

Response `200`:
```json
{
  "success": true,
  "data": {
    "listings": [
      { "id": "uuid", "title": "Cozy apartment near Bole", "hostName": "Melat Worku", "active": true }
    ]
  }
}
```

---

### `DELETE /api/admin/listings/:id`

Removes a listing that violates platform rules.

Response `200`:
```json
{ "success": true, "message": "Listing removed" }
```

Errors: `401`, `403` (not admin), `404`

---

### `GET /api/admin/reviews`

Returns all reviews on the platform, for moderation.

Response `200`:
```json
{
  "success": true,
  "data": {
    "reviews": [
      { "id": "uuid", "listingId": "uuid", "guestName": "Kidus K.", "rating": 5, "text": "Great stay!" }
    ]
  }
}
```

---

### `DELETE /api/admin/reviews/:id`

Removes a review that violates platform rules.

Response `200`:
```json
{ "success": true, "message": "Review removed" }
```

Errors: `401`, `403` (not admin), `404`

---

## Authorization Rules Summary

- Guests can create bookings and reviews.
- Hosts can create, edit, and delete only their own listings, and view bookings made on their own listings.
- A user must be logged in (valid JWT) to access any protected endpoint.
- Admin-only endpoints require the `ADMIN` role and return `403` otherwise.
- A guest cannot review a listing without a completed booking on it, and cannot review the same listing twice.
- Overlapping bookings for the same listing return `409 Conflict`.
- Ownership checks (editing a listing, viewing a booking) compare the JWT's user id against the resource's owner id; mismatches return `403`, not `404`, so the client can distinguish "doesn't exist" from "not yours."
