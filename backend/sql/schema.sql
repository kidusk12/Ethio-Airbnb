-- Ethio-Airbnb (EthioStays) database schema (PostgreSQL)
-- Matches api-contract.md v3.1 + review decisions (name fields, delete
-- account, payment resubmission, listing edit->pending, hasReviewed).
--
-- This file reflects the LIVE schema as of 2026-08-22, after full
-- integration testing. It was re-synced against a `pg_dump --schema-only`
-- of the running `ethiostays` database to fix drift that accumulated
-- during development (missing columns discovered via real 500 errors:
-- listings.amenities, listings.agreed_to_terms, listings.updated_at,
-- payments.confirmed_by_admin_id, payments.rejected_by_admin_id,
-- payouts.paid_by_admin_id). Running this file fresh (e.g. in Docker)
-- will now produce the same schema the app actually runs against.

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

-- =====================================================================
-- USERS
-- =====================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,

  role VARCHAR(10) NOT NULL CHECK (role IN ('guest', 'host', 'admin')),

  -- Host-only. Set once via PUT /hosts/verification, reused across all
  -- of that host's listings. idVerified (GET /auth/me) is computed as
  -- id_document_url IS NOT NULL, not stored separately.
  id_document_url TEXT,

  -- Soft delete (DELETE /auth/me). Row is kept — bookings, reviews, and
  -- transactions may still reference this user. Email stays reserved,
  -- not freed for reuse. NULL = active account.
  deleted_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- =====================================================================
-- LISTINGS
-- =====================================================================
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES users(id),

  category VARCHAR(100)
    CHECK (category IN ('apartment', 'villa', 'hotel', 'guesthouse', 'private_room', 'unique_stay')),

  title VARCHAR(150) NOT NULL,
  description TEXT,

  -- Legacy free-text location field, predates city/sub_city/street_address.
  -- Not written or read by current application code (listing.repository.js
  -- builds the address from city/sub_city/street_address instead) but kept
  -- nullable here since old rows/tooling may still reference it.
  location VARCHAR(150),

  city VARCHAR(100),
  sub_city VARCHAR(100),
  street_address VARCHAR(200),

  house_deed_photo_url TEXT, -- per-listing, unlike id_document_url
  photos TEXT[] DEFAULT '{}',

  -- Legacy single-image field, predates the photos[] array. Not written
  -- by current application code; toListingSummaryDto/toAdminListingDto
  -- read photos[0] as the cover image instead. Kept nullable for any
  -- old rows or tooling that still reference it.
  cover_photo TEXT,

  amenities TEXT[] DEFAULT '{}', -- lowercase values: 'wifi','kitchen','free_parking','washer'
  bedrooms SMALLINT,
  bathrooms SMALLINT,
  max_guests SMALLINT,

  price_per_night NUMERIC(10,2) NOT NULL,
  house_rules TEXT[] DEFAULT '{}', -- free text, presets + custom, no enum

  agreed_to_terms BOOLEAN NOT NULL DEFAULT false,

  -- Two independent lifecycle flags — do not conflate:
  -- status = admin approval workflow. active = host's own soft delete.
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  active BOOLEAN DEFAULT true,

  approved_by_admin_id UUID REFERENCES users(id),
  rejected_by_admin_id UUID REFERENCES users(id),
  rejection_reason TEXT,

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()

  -- Business rule (not enforceable in SQL, enforced in the PUT /listings/:id
  -- handler): any edit to an 'approved' listing unconditionally resets
  -- status back to 'pending', regardless of which fields changed.
);

CREATE INDEX idx_listings_public_browse ON listings (status, active) WHERE status = 'approved' AND active = true;
CREATE INDEX idx_listings_host ON listings (host_id);
CREATE INDEX idx_listings_status ON listings (status);

-- =====================================================================
-- BOOKINGS
-- =====================================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  guest_id UUID NOT NULL REFERENCES users(id),

  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guest_count SMALLINT NOT NULL,

  total_price NUMERIC(10,2) NOT NULL, -- always server-calculated

  -- Only 3 states — 'completed' is NOT a stored status; a booking is
  -- treated as complete when status = 'confirmed' AND check_out < now().
  status VARCHAR(20) NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment', 'confirmed', 'cancelled')),

  -- The single enforcement clock for the whole pending_payment window.
  -- Set once at creation (created_at + 1h), NEVER reset by a later
  -- receipt upload or resubmission.
  payment_deadline TIMESTAMP NOT NULL,

  -- Set when an admin confirms payment. Anchors the 24h self-service
  -- cancellation window post-confirmation.
  payment_confirmed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT now(),

  CHECK (check_out > check_in)
);

CREATE INDEX idx_bookings_listing_dates ON bookings (listing_id, check_in, check_out);
CREATE INDEX idx_bookings_guest ON bookings (guest_id);
CREATE INDEX idx_bookings_pending_deadline ON bookings (payment_deadline) WHERE status = 'pending_payment';

-- =====================================================================
-- PAYMENTS
-- One-to-many with bookings: a rejected receipt is never deleted or
-- overwritten, it stays as a historical row. A new POST
-- /bookings/:id/payment-receipt after a rejection creates a fresh row.
-- The "active" payment for a booking is simply its most recent row
-- (ORDER BY submitted_at DESC LIMIT 1).
-- =====================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),

  receipt_image_url TEXT NOT NULL,
  transaction_code VARCHAR(100), -- set by admin on confirm

  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired', 'refunded')),

  submitted_at TIMESTAMP DEFAULT now(), -- informational only, NOT the enforcement clock
  confirmed_at TIMESTAMP,

  confirmed_by_admin_id UUID REFERENCES users(id),
  rejected_by_admin_id UUID REFERENCES users(id),
  rejection_reason TEXT,

  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_payments_booking ON payments (booking_id, submitted_at DESC);
CREATE INDEX idx_payments_booking_id ON payments (booking_id);

-- =====================================================================
-- PAYOUTS
-- =====================================================================
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  host_id UUID NOT NULL REFERENCES users(id),

  amount NUMERIC(10,2) NOT NULL,
  transaction_code VARCHAR(100), -- set by admin on mark-paid

  status VARCHAR(20) NOT NULL DEFAULT 'due'
    CHECK (status IN ('due', 'paid', 'voided')),

  -- Real timestamp; the 24h countdown shown to admins is computed
  -- client-side from this, not stored as a separate deadline column.
  payment_confirmed_at TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,

  paid_by_admin_id UUID REFERENCES users(id),

  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_payouts_due ON payouts (status) WHERE status = 'due';
CREATE INDEX idx_payouts_host ON payouts (host_id);
CREATE INDEX idx_payouts_host_id ON payouts (host_id);
CREATE INDEX idx_payouts_booking_id ON payouts (booking_id);

-- =====================================================================
-- TRANSACTIONS (audit log — read-only from the API)
-- Names are denormalized (counterparty_name, performed_by_admin_name)
-- intentionally: a permanent audit record must survive even if the
-- referenced user is later edited or soft-deleted.
-- =====================================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('userPayment', 'hostPayout')),

  counterparty_name VARCHAR(150) NOT NULL, -- guest name (userPayment) or host name (hostPayout), snapshotted
  amount NUMERIC(10,2) NOT NULL,

  booking_id UUID NOT NULL REFERENCES bookings(id),
  performed_by_admin_id UUID NOT NULL REFERENCES users(id),
  performed_by_admin_name VARCHAR(100) NOT NULL, -- snapshotted; admin name is locked post-creation but denormalized here regardless, matching the pattern

  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_transactions_booking ON transactions (booking_id);
CREATE INDEX idx_transactions_booking_id ON transactions (booking_id);
CREATE INDEX idx_transactions_created_at ON transactions (created_at DESC);

-- =====================================================================
-- REVIEWS
-- Tied to a specific booking (not just guest+listing) so the same guest
-- can review the same listing again after a separate, later stay.
-- =====================================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  listing_id UUID NOT NULL REFERENCES listings(id), -- denormalized for GET /reviews/listing/:id without a join through bookings
  guest_id UUID NOT NULL REFERENCES users(id),

  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT,

  created_at TIMESTAMP DEFAULT now(),

  -- NOT UNIQUE(guest_id, listing_id) — that would incorrectly block a
  -- second, legitimate review after a separate stay.
  UNIQUE (booking_id)
);

CREATE INDEX idx_reviews_listing ON reviews (listing_id);
CREATE INDEX idx_reviews_listing_id ON reviews (listing_id);
CREATE INDEX idx_reviews_booking_id ON reviews (booking_id);