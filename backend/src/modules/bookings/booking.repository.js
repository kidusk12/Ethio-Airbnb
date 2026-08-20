import pool from '../../config/db.js';

export async function withTransaction(callback) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await callback(client);

    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function findBookableListingForUpdate(client, listingId) {
  const { rows } = await client.query(
    `
      SELECT
        id,
        host_id,
        title,
        max_guests,
        price_per_night
      FROM listings
      WHERE id = $1
        AND status = 'approved'
        AND active = true
      FOR UPDATE
    `,
    [listingId],
  );

  return rows[0] ?? null;
}

export async function findBookableListing(listingId) {
  const { rows } = await pool.query(
    `
      SELECT
        id,
        host_id,
        title,
        max_guests,
        price_per_night
      FROM listings
      WHERE id = $1
        AND status = 'approved'
        AND active = true
    `,
    [listingId],
  );

  return rows[0] ?? null;
}

export async function expirePendingBookingsForListing(
  client,
  listingId,
) {
  await client.query(
    `
      WITH expired_bookings AS (
        UPDATE bookings
        SET status = 'cancelled'
        WHERE listing_id = $1
          AND status = 'pending_payment'
          AND payment_deadline < now()
        RETURNING id
      )
      UPDATE payments
      SET status = 'expired'
      WHERE booking_id IN (SELECT id FROM expired_bookings)
        AND status = 'pending'
    `,
    [listingId],
  );
}

export async function expirePendingBookingsForGuest(guestId) {
  await pool.query(
    `
      WITH expired_bookings AS (
        UPDATE bookings
        SET status = 'cancelled'
        WHERE guest_id = $1
          AND status = 'pending_payment'
          AND payment_deadline < now()
        RETURNING id
      )
      UPDATE payments
      SET status = 'expired'
      WHERE booking_id IN (SELECT id FROM expired_bookings)
        AND status = 'pending'
    `,
    [guestId],
  );
}

export async function expirePendingBookingsForHost(hostId) {
  await pool.query(
    `
      WITH expired_bookings AS (
        UPDATE bookings b
        SET status = 'cancelled'
        FROM listings l
        WHERE b.listing_id = l.id
          AND l.host_id = $1
          AND b.status = 'pending_payment'
          AND b.payment_deadline < now()
        RETURNING b.id
      )
      UPDATE payments
      SET status = 'expired'
      WHERE booking_id IN (SELECT id FROM expired_bookings)
        AND status = 'pending'
    `,
    [hostId],
  );
}

// Global sweep, not scoped to one listing/guest/host — used by
// GET /admin/payments/pending, which has no natural scope to filter by.
export async function expireAllStalePendingBookings() {
  await pool.query(`
    WITH expired_bookings AS (
      UPDATE bookings
      SET status = 'cancelled'
      WHERE status = 'pending_payment'
        AND payment_deadline < now()
      RETURNING id
    )
    UPDATE payments
    SET status = 'expired'
    WHERE booking_id IN (SELECT id FROM expired_bookings)
      AND status = 'pending'
  `);
}

export async function hasOverlappingBooking(
  client,
  { listingId, checkIn, checkOut },
) {
  const { rows } = await client.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM bookings
        WHERE listing_id = $1
          AND status IN ('pending_payment', 'confirmed')
          AND check_in < $3::date
          AND check_out > $2::date
      ) AS has_overlap
    `,
    [listingId, checkIn, checkOut],
  );

  return rows[0].has_overlap;
}

export async function createBooking(
  client,
  {
    listingId,
    guestId,
    checkIn,
    checkOut,
    guestCount,
    totalPrice,
  },
) {
  const { rows } = await client.query(
    `
      INSERT INTO bookings (
        listing_id,
        guest_id,
        check_in,
        check_out,
        guest_count,
        total_price,
        status,
        payment_deadline
      )
      VALUES (
        $1, $2, $3::date, $4::date, $5, $6,
        'pending_payment',
        now() + interval '1 hour'
      )
      RETURNING
        id,
        total_price,
        status,
        payment_deadline
    `,
    [
      listingId,
      guestId,
      checkIn,
      checkOut,
      guestCount,
      totalPrice,
    ],
  );

  return rows[0];
}

export async function findGuestBookings(guestId) {
  const { rows } = await pool.query(
    `
      SELECT
        b.id,
        b.listing_id,
        b.check_in,
        b.check_out,
        b.guest_count,
        b.total_price,
        b.status,
        b.payment_deadline,

        l.title AS listing_title,
        l.photos[1] AS cover_photo,

        EXISTS (
          SELECT 1
          FROM reviews r
          WHERE r.booking_id = b.id
        ) AS has_reviewed

      FROM bookings b
      INNER JOIN listings l ON l.id = b.listing_id
      WHERE b.guest_id = $1
      ORDER BY b.created_at DESC
    `,
    [guestId],
  );

  return rows;
}

export async function findHostBookings(hostId) {
  const { rows } = await pool.query(
    `
      SELECT
        b.id,
        b.listing_id,
        b.check_in,
        b.check_out,
        b.guest_count,
        b.total_price,
        b.status,
        b.payment_deadline,

        l.title AS listing_title,
        l.photos[1] AS cover_photo,

        u.first_name AS guest_first_name,
        u.middle_name AS guest_middle_name,
        u.last_name AS guest_last_name

      FROM bookings b
      INNER JOIN listings l ON l.id = b.listing_id
      INNER JOIN users u ON u.id = b.guest_id
      WHERE l.host_id = $1
      ORDER BY b.created_at DESC
    `,
    [hostId],
  );

  return rows;
}

export async function findGuestBookingForUpdate(
  client,
  bookingId,
  guestId,
) {
  const { rows } = await client.query(
    `
      SELECT
        id,
        guest_id,
        status,
        payment_deadline,
        payment_confirmed_at
      FROM bookings
      WHERE id = $1
        AND guest_id = $2
      FOR UPDATE
    `,
    [bookingId, guestId],
  );

  return rows[0] ?? null;
}

export async function expireSinglePendingBooking(client, bookingId) {
  await client.query(
    `
      WITH expired_booking AS (
        UPDATE bookings
        SET status = 'cancelled'
        WHERE id = $1
          AND status = 'pending_payment'
          AND payment_deadline < now()
        RETURNING id
      )
      UPDATE payments
      SET status = 'expired'
      WHERE booking_id IN (SELECT id FROM expired_booking)
        AND status = 'pending'
    `,
    [bookingId],
  );
}

export async function cancelPendingBooking(client, bookingId) {
  const { rows } = await client.query(
    `
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = $1
        AND status = 'pending_payment'
      RETURNING id, status
    `,
    [bookingId],
  );

  return rows[0] ?? null;
}

export async function cancelConfirmedBooking(client, bookingId) {
  const { rows } = await client.query(
    `
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = $1
        AND status = 'confirmed'
      RETURNING id, status
    `,
    [bookingId],
  );

  return rows[0] ?? null;
}

// A confirmed booking only ever has exactly one 'confirmed' payment row
// (submitPaymentReceipt refuses new receipts once status leaves
// 'pending_payment'), so no booking_id + submitted_at ordering is needed
// here unlike the payments module's "latest row" pattern.
export async function refundConfirmedPayment(client, bookingId) {
  await client.query(
    `
      UPDATE payments
      SET status = 'refunded'
      WHERE booking_id = $1
        AND status = 'confirmed'
    `,
    [bookingId],
  );
}