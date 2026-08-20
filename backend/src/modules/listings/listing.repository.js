import pool from '../../config/db.js';

const listingColumns = `
  id,
  host_id,
  category,
  title,
  description,
  city,
  sub_city,
  street_address,
  house_deed_photo_url,
  photos,
  amenities,
  bedrooms,
  bathrooms,
  max_guests,
  price_per_night,
  house_rules,
  agreed_to_terms,
  status,
  active,
  rejection_reason,
  created_at,
  updated_at
`;

export async function createListing({
  hostId,
  category,
  city,
  subCity,
  streetAddress,
  houseDeedPhotoUrl,
  photos,
  title,
  description,
  amenities,
  bedrooms,
  bathrooms,
  maxGuests,
  pricePerNight,
  houseRules,
  agreedToTerms,
}) {
  const { rows } = await pool.query(
    `
      INSERT INTO listings (
        host_id,
        category,
        city,
        sub_city,
        street_address,
        house_deed_photo_url,
        photos,
        title,
        description,
        amenities,
        bedrooms,
        bathrooms,
        max_guests,
        price_per_night,
        house_rules,
        agreed_to_terms
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16
      )
      RETURNING ${listingColumns}
    `,
    [
      hostId,
      category,
      city,
      subCity,
      streetAddress,
      houseDeedPhotoUrl,
      photos,
      title,
      description,
      amenities,
      bedrooms,
      bathrooms,
      maxGuests,
      pricePerNight,
      houseRules,
      agreedToTerms,
    ],
  );

  return rows[0];
}

export async function findListingById(id) {
  const { rows } = await pool.query(
    `SELECT ${listingColumns} FROM listings WHERE id = $1`,
    [id],
  );

  return rows[0] ?? null;
}

export async function findPublicListingById(id) {
  const { rows } = await pool.query(
    `
      SELECT
        l.*,
        u.first_name AS host_first_name,
        u.middle_name AS host_middle_name,
        u.last_name AS host_last_name,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.id) AS review_count
      FROM listings l
      JOIN users u ON u.id = l.host_id
      LEFT JOIN reviews r ON r.listing_id = l.id
      WHERE l.id = $1
        AND l.status = 'approved'
        AND l.active = true
      GROUP BY l.id, u.id
    `,
    [id],
  );

  return rows[0] ?? null;
}

export async function findMyListings(hostId) {
  const { rows } = await pool.query(
    `
      SELECT ${listingColumns}
      FROM listings
      WHERE host_id = $1
      ORDER BY created_at DESC
    `,
    [hostId],
  );

  return rows;
}

export async function findPublicListings({
  location,
  minPrice,
  maxPrice,
  category,
  checkIn,
  checkOut,
  page,
  limit,
}) {
  const values = [];
  const conditions = [
    `l.status = 'approved'`,
    `l.active = true`,
  ];

  if (location) {
    values.push(`%${location}%`);
    conditions.push(
      `(l.city ILIKE $${values.length} OR l.sub_city ILIKE $${values.length})`,
    );
  }

  if (minPrice !== undefined) {
    values.push(minPrice);
    conditions.push(`l.price_per_night >= $${values.length}`);
  }

  if (maxPrice !== undefined) {
    values.push(maxPrice);
    conditions.push(`l.price_per_night <= $${values.length}`);
  }

  if (category) {
    values.push(category);
    conditions.push(`l.category = $${values.length}`);
  }

  if (checkIn && checkOut) {
    values.push(checkIn, checkOut);

    conditions.push(`
      NOT EXISTS (
        SELECT 1
        FROM bookings b
        WHERE b.listing_id = l.id
          AND b.status IN ('pending_payment', 'confirmed')
          AND b.check_in < $${values.length}
          AND b.check_out > $${values.length - 1}
      )
    `);
  }

  const whereClause = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  values.push(limit, offset);

  const listingsResult = await pool.query(
    `
      SELECT
        l.*,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.id)::int AS review_count
      FROM listings l
      LEFT JOIN reviews r ON r.listing_id = l.id
      WHERE ${whereClause}
      GROUP BY l.id
      ORDER BY l.created_at DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `,
    values,
  );

  const countValues = values.slice(0, -2);
  const countResult = await pool.query(
    `
      SELECT COUNT(DISTINCT l.id)::int AS count
      FROM listings l
      WHERE ${whereClause}
    `,
    countValues,
  );

  return {
    listings: listingsResult.rows,
    totalResults: countResult.rows[0].count,
  };
}

export async function updateListing(id, fields) {
  const entries = Object.entries(fields);

  if (entries.length === 0) {
    return findListingById(id);
  }

  const setClause = entries
    .map(([column], index) => `${column} = $${index + 1}`)
    .join(', ');

  const values = entries.map(([, value]) => value);

  const { rows } = await pool.query(
    `
      UPDATE listings
      SET ${setClause}, updated_at = now()
      WHERE id = $${values.length + 1}
      RETURNING ${listingColumns}
    `,
    [...values, id],
  );

  return rows[0] ?? null;
}

export async function softDeleteListing(id) {
  const { rows } = await pool.query(
    `
      UPDATE listings
      SET active = false, updated_at = now()
      WHERE id = $1
      RETURNING ${listingColumns}
    `,
    [id],
  );

  return rows[0] ?? null;
}