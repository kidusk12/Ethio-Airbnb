-- Ethio-Airbnb schema — v3.2
-- Re-runnable from scratch: drop everything and recreate.
-- ⚠ PR NOTE: Anyone with an existing local DB must drop it and re-run this file.
--   There is no migration tooling; update this file directly and re-run.
--   Command: psql -U postgres -d ethio_airbnb -f sql/schema.sql

-- ---------------------------------------------------------------------------
-- Teardown (reverse dependency order)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS transactions  CASCADE;
DROP TABLE IF EXISTS payouts       CASCADE;
DROP TABLE IF EXISTS payments      CASCADE;
DROP TABLE IF EXISTS reviews       CASCADE;
DROP TABLE IF EXISTS bookings      CASCADE;
DROP TABLE IF EXISTS listings      CASCADE;
DROP TABLE IF EXISTS users         CASCADE;

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(100) NOT NULL,
  email            VARCHAR(255) UNIQUE NOT NULL,
  password_hash    TEXT         NOT NULL,
  role             VARCHAR(10)  NOT NULL CHECK (role IN ('guest','host','admin')),
  id_document_url  TEXT,                         -- nullable; used by admin listing-approval view
  created_at       TIMESTAMP    DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- listings
-- ⚠ DEV NOTE FOR listings.js: several columns added here that your routes need.
--   Specifically: category, sub_city, street_address, house_deed_photo_url,
--   bedrooms, bathrooms, max_guests, house_rules, status, approved_by_admin_id,
--   rejected_by_admin_id, rejection_reason.
--   New listings should default to status='pending' (not 'approved').
-- ---------------------------------------------------------------------------
CREATE TABLE listings (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id               UUID          NOT NULL REFERENCES users(id),
  title                 VARCHAR(150)  NOT NULL,
  description           TEXT,
  -- location fields
  location              VARCHAR(150)  NOT NULL,   -- legacy; keep for existing queries
  city                  VARCHAR(100),
  sub_city              VARCHAR(100),
  street_address        VARCHAR(200),
  -- categorisation
  category              VARCHAR(100),
  -- property details
  bedrooms              INTEGER,
  bathrooms             INTEGER,
  max_guests            INTEGER,
  house_rules           TEXT[],
  -- pricing
  price_per_night       NUMERIC(10,2) NOT NULL,
  -- media
  cover_photo           TEXT,
  photos                TEXT[],
  house_deed_photo_url  TEXT,
  -- moderation
  status                VARCHAR(20)   NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','approved','rejected')),
  approved_by_admin_id  UUID          REFERENCES users(id),
  rejected_by_admin_id  UUID          REFERENCES users(id),
  rejection_reason      TEXT,
  -- soft-delete (used by admin DELETE /listings/:id and listings.js)
  active                BOOLEAN       DEFAULT true,
  created_at            TIMESTAMP     DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- bookings
-- Enum per v3.2 contract: pending_payment | confirmed | cancelled
-- (completed removed — was in old schema, not in contract)
-- ---------------------------------------------------------------------------
CREATE TABLE bookings (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id            UUID          NOT NULL REFERENCES listings(id),
  guest_id              UUID          NOT NULL REFERENCES users(id),
  check_in              DATE          NOT NULL,
  check_out             DATE          NOT NULL,
  guest_count           INTEGER       NOT NULL,
  total_price           NUMERIC(10,2) NOT NULL,
  status                VARCHAR(20)   NOT NULL DEFAULT 'pending_payment'
                          CHECK (status IN ('pending_payment','confirmed','cancelled')),
  payment_deadline      TIMESTAMP     NOT NULL,   -- set at creation; never updated after
  payment_confirmed_at  TIMESTAMP,                -- set by admin confirm; drives 24h cancel window
  created_at            TIMESTAMP     DEFAULT now(),
  CHECK (check_out > check_in)
);

-- ---------------------------------------------------------------------------
-- payments
-- One-to-many with bookings (no unique constraint — resubmission after rejection
-- creates a new row; always query ORDER BY created_at DESC LIMIT 1 for active).
-- ---------------------------------------------------------------------------
CREATE TABLE payments (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id       UUID          NOT NULL REFERENCES bookings(id),
  receipt_image_url TEXT         NOT NULL,
  status           VARCHAR(20)   NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','rejected','expired','refunded')),
  transaction_code VARCHAR(100),
  rejection_reason TEXT,
  submitted_at     TIMESTAMP     DEFAULT now(),
  confirmed_at     TIMESTAMP,
  created_at       TIMESTAMP     DEFAULT now()
);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);

-- ---------------------------------------------------------------------------
-- payouts
-- Created by admin when confirming a payment.
-- ---------------------------------------------------------------------------
CREATE TABLE payouts (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID          NOT NULL REFERENCES bookings(id),
  host_id               UUID          NOT NULL REFERENCES users(id),
  amount                NUMERIC(10,2) NOT NULL,
  status                VARCHAR(20)   NOT NULL DEFAULT 'due'
                          CHECK (status IN ('due','paid','voided')),
  transaction_code      VARCHAR(100),
  payment_confirmed_at  TIMESTAMP     NOT NULL,
  paid_at               TIMESTAMP,
  created_at            TIMESTAMP     DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- transactions
-- Append-only audit log. No UPDATE or DELETE ever issued against this table.
-- ---------------------------------------------------------------------------
CREATE TABLE transactions (
  id                       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code         VARCHAR(100)  NOT NULL,
  type                     VARCHAR(20)   NOT NULL CHECK (type IN ('userPayment','hostPayout')),
  booking_id               UUID          NOT NULL REFERENCES bookings(id),
  counterparty_name        VARCHAR(150)  NOT NULL,
  amount                   NUMERIC(10,2) NOT NULL,
  performed_by_admin_id    UUID          NOT NULL REFERENCES users(id),
  performed_by_admin_name  VARCHAR(100)  NOT NULL,
  created_at               TIMESTAMP     DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- reviews
-- UNIQUE is per booking, not per (guest, listing) — a guest may review the
-- same listing again after a separate stay, but cannot review one booking twice.
-- ---------------------------------------------------------------------------
CREATE TABLE reviews (
  id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID      NOT NULL REFERENCES listings(id),
  guest_id    UUID      NOT NULL REFERENCES users(id),
  booking_id  UUID      NOT NULL REFERENCES bookings(id),
  rating      SMALLINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text        TEXT,
  created_at  TIMESTAMP DEFAULT now(),
  UNIQUE (booking_id)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_listings_location       ON listings(location);
CREATE INDEX idx_listings_status         ON listings(status);
CREATE INDEX idx_bookings_listing_id     ON bookings(listing_id);
CREATE INDEX idx_bookings_guest_id       ON bookings(guest_id);
CREATE INDEX idx_bookings_status         ON bookings(status);
CREATE INDEX idx_reviews_listing_id      ON reviews(listing_id);
CREATE INDEX idx_reviews_booking_id      ON reviews(booking_id);
CREATE INDEX idx_payouts_booking_id      ON payouts(booking_id);
CREATE INDEX idx_payouts_host_id         ON payouts(host_id);
CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);