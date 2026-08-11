-- -- Ethio-Airbnb schema
-- -- Run this once against your Postgres database to set up all tables.

-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS bookings CASCADE;
-- DROP TABLE IF EXISTS listings CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- CREATE TABLE users (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     email VARCHAR(150) UNIQUE NOT NULL,
--     password_hash TEXT NOT NULL,
--     role VARCHAR(20) NOT NULL CHECK (role IN ('guest', 'host', 'admin')),
--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- CREATE TABLE listings (
--     id SERIAL PRIMARY KEY,
--     host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     title VARCHAR(150) NOT NULL,
--     description TEXT,
--     city VARCHAR(100) NOT NULL,
--     price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night > 0),
--     image_url TEXT,
--     status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- CREATE TABLE bookings (
--     id SERIAL PRIMARY KEY,
--     listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
--     guest_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     start_date DATE NOT NULL,
--     end_date DATE NOT NULL,
--     status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
--     created_at TIMESTAMP DEFAULT NOW(),
--     CHECK (end_date > start_date)
-- );

-- CREATE TABLE reviews (
--     id SERIAL PRIMARY KEY,
--     listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
--     guest_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
--     comment TEXT,
--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- -- Speeds up the most common queries (search by city, look up bookings per listing)
-- CREATE INDEX idx_listings_city ON listings(city);
-- CREATE INDEX idx_bookings_listing ON bookings(listing_id);
-- CREATE INDEX idx_reviews_listing ON reviews(listing_id);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('guest','host','admin')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(150) NOT NULL,
  description TEXT,
  location VARCHAR(150) NOT NULL,
  price_per_night NUMERIC(10,2) NOT NULL,
  photos TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  guest_id UUID NOT NULL REFERENCES users(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment','confirmed','completed','cancelled')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  guest_id UUID NOT NULL REFERENCES users(id),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE (guest_id, listing_id)
);

CREATE INDEX idx_listings_location ON listings(location);
CREATE INDEX idx_bookings_listing_id ON bookings(listing_id);
