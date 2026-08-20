import pool from '../../config/db.js';

export async function createPaymentReceipt(
  client,
  { bookingId, receiptImageUrl },
) {
  const { rows } = await client.query(
    `
      INSERT INTO payments (booking_id, receipt_image_url, status, submitted_at)
      VALUES ($1, $2, 'pending', now())
      RETURNING id, booking_id, status, submitted_at
    `,
    [bookingId, receiptImageUrl],
  );

  return rows[0];
}

export async function findLatestPaymentForBooking(client, bookingId) {
  const { rows } = await client.query(
    `
      SELECT id, booking_id, status, submitted_at, confirmed_at
      FROM payments
      WHERE booking_id = $1
      ORDER BY submitted_at DESC
      LIMIT 1
    `,
    [bookingId],
  );

  return rows[0] ?? null;
}

// Locks both the payment row and its parent booking row so a confirm/reject
// can safely read-then-write in one atomic transaction. FOR UPDATE OF
// restricts the lock to payments+bookings — the joined listings/users rows
// are read-only here and don't need to be locked.
export async function findPaymentForAdminUpdate(client, paymentId) {
  const { rows } = await client.query(
    `
      SELECT
        p.id AS payment_id,
        p.booking_id,
        p.status AS payment_status,

        b.status AS booking_status,
        b.payment_deadline,
        b.total_price,
        b.guest_id,

        l.host_id,

        guest.first_name AS guest_first_name,
        guest.middle_name AS guest_middle_name,
        guest.last_name AS guest_last_name,

        host.first_name AS host_first_name,
        host.middle_name AS host_middle_name,
        host.last_name AS host_last_name
      FROM payments p
      JOIN bookings b ON b.id = p.booking_id
      JOIN listings l ON l.id = b.listing_id
      JOIN users guest ON guest.id = b.guest_id
      JOIN users host ON host.id = l.host_id
      WHERE p.id = $1
      FOR UPDATE OF p, b
    `,
    [paymentId],
  );

  return rows[0] ?? null;
}

export async function confirmPaymentAtomic(
  client,
  {
    paymentId,
    bookingId,
    transactionCode,
    adminId,
    adminFullName,
    hostId,
    guestFullName,
    totalPrice,
    payoutAmount,
  },
) {
  await client.query(
    `
      UPDATE payments
      SET status = 'confirmed',
          transaction_code = $2,
          confirmed_at = now(),
          confirmed_by_admin_id = $3
      WHERE id = $1
    `,
    [paymentId, transactionCode, adminId],
  );

  await client.query(
    `
      UPDATE bookings
      SET status = 'confirmed',
          payment_confirmed_at = now()
      WHERE id = $1
    `,
    [bookingId],
  );

  await client.query(
    `
      INSERT INTO payouts (booking_id, host_id, amount, payment_confirmed_at, status)
      VALUES ($1, $2, $3, now(), 'due')
    `,
    [bookingId, hostId, payoutAmount],
  );

  await client.query(
    `
      INSERT INTO transactions (
        transaction_code, type, counterparty_name, amount,
        booking_id, performed_by_admin_id, performed_by_admin_name
      )
      VALUES ($1, 'userPayment', $2, $3, $4, $5, $6)
    `,
    [
      transactionCode,
      guestFullName,
      totalPrice,
      bookingId,
      adminId,
      adminFullName,
    ],
  );
}

// Booking is intentionally left untouched (still 'pending_payment') — the
// guest is allowed to submit a new receipt before the original deadline.
export async function rejectPaymentAtomic(
  client,
  { paymentId, reason, adminId },
) {
  await client.query(
    `
      UPDATE payments
      SET status = 'rejected',
          rejection_reason = $2,
          rejected_by_admin_id = $3
      WHERE id = $1
    `,
    [paymentId, reason || null, adminId],
  );
}

// Only the most recent payment row per booking counts as "awaiting
// review" — an older rejected attempt for the same booking shouldn't
// show up once a fresh one has been submitted.
export async function findPendingPaymentsQueue() {
  const { rows } = await pool.query(`
    SELECT * FROM (
      SELECT DISTINCT ON (p.booking_id)
        p.id AS payment_id,
        p.booking_id,
        p.receipt_image_url,
        p.status,
        p.submitted_at,

        b.payment_deadline,
        b.total_price,

        l.title AS listing_title,

        guest.first_name AS guest_first_name,
        guest.middle_name AS guest_middle_name,
        guest.last_name AS guest_last_name,

        host.first_name AS host_first_name,
        host.middle_name AS host_middle_name,
        host.last_name AS host_last_name
      FROM payments p
      JOIN bookings b ON b.id = p.booking_id
      JOIN listings l ON l.id = b.listing_id
      JOIN users guest ON guest.id = b.guest_id
      JOIN users host ON host.id = l.host_id
      WHERE b.status = 'pending_payment'
      ORDER BY p.booking_id, p.submitted_at DESC
    ) latest
    WHERE latest.status = 'pending'
    ORDER BY latest.submitted_at ASC
  `);

  return rows;
}