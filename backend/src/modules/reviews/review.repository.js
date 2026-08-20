import pool from '../../config/db.js';

export async function findPublicReviewsByListingId(listingId) {
  const { rows } = await pool.query(
    `
      SELECT
        r.id,
        r.rating,
        r.text,
        r.created_at,
        CONCAT_WS(
          ' ',
          u.first_name,
          u.middle_name,
          u.last_name
        ) AS guest_name
      FROM reviews r
      INNER JOIN users u ON u.id = r.guest_id
      WHERE r.listing_id = $1
      ORDER BY r.created_at DESC
    `,
    [listingId],
  );

  return rows;
}

export async function getAverageRatingForListing(listingId) {
  const { rows } = await pool.query(
    `
      SELECT COALESCE(AVG(rating), 0) AS average_rating
      FROM reviews
      WHERE listing_id = $1
    `,
    [listingId],
  );

  return Number(rows[0].average_rating);
}

export async function findBookingById(bookingId) {
  const { rows } = await pool.query(
    `
      SELECT
        id,
        listing_id,
        guest_id,
        status,
        check_out
      FROM bookings
      WHERE id = $1
    `,
    [bookingId],
  );

  return rows[0] ?? null;
}

export async function createReview({
  bookingId,
  listingId,
  guestId,
  rating,
  text,
}) {
  const { rows } = await pool.query(
    `
      INSERT INTO reviews (
        booking_id,
        listing_id,
        guest_id,
        rating,
        text
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [
      bookingId,
      listingId,
      guestId,
      rating,
      text?.trim() || null,
    ],
  );

  return rows[0];
}

export async function findAllReviewsForAdmin() {
  const { rows } = await pool.query(
    `
      SELECT
        r.id,
        r.booking_id,
        r.listing_id,
        r.guest_id,
        r.rating,
        r.text,
        r.created_at,

        l.title AS listing_title,

        CONCAT_WS(
          ' ',
          u.first_name,
          u.middle_name,
          u.last_name
        ) AS guest_name,
        u.email AS guest_email

      FROM reviews r
      INNER JOIN listings l ON l.id = r.listing_id
      INNER JOIN users u ON u.id = r.guest_id
      ORDER BY r.created_at DESC
    `,
  );

  return rows;
}

export async function deleteReviewById(reviewId) {
  const { rows } = await pool.query(
    `
      DELETE FROM reviews
      WHERE id = $1
      RETURNING id
    `,
    [reviewId],
  );

  return rows[0] ?? null;
}