import pool from '../../config/db.js';

export async function findDuePayouts() {
  const { rows } = await pool.query(`
    SELECT
      p.id AS payout_id,
      p.booking_id,
      p.amount,
      p.payment_confirmed_at,

      l.title AS listing_title,

      guest.first_name AS guest_first_name,
      guest.middle_name AS guest_middle_name,
      guest.last_name AS guest_last_name,

      host.first_name AS host_first_name,
      host.middle_name AS host_middle_name,
      host.last_name AS host_last_name
    FROM payouts p
    JOIN bookings b ON b.id = p.booking_id
    JOIN listings l ON l.id = b.listing_id
    JOIN users guest ON guest.id = b.guest_id
    JOIN users host ON host.id = p.host_id
    WHERE p.status = 'due'
    ORDER BY p.payment_confirmed_at ASC
  `);

  return rows;
}

// Locks the payout row for the mark-paid transaction. FOR UPDATE OF p
// restricts the lock to payouts — the joined host row is read-only here.
export async function findPayoutForAdminUpdate(client, payoutId) {
  const { rows } = await client.query(
    `
      SELECT
        p.id AS payout_id,
        p.booking_id,
        p.status,
        p.amount,
        p.host_id,

        host.first_name AS host_first_name,
        host.middle_name AS host_middle_name,
        host.last_name AS host_last_name
      FROM payouts p
      JOIN users host ON host.id = p.host_id
      WHERE p.id = $1
      FOR UPDATE OF p
    `,
    [payoutId],
  );

  return rows[0] ?? null;
}

export async function markPayoutPaidAtomic(
  client,
  {
    payoutId,
    transactionCode,
    adminId,
    adminFullName,
    hostFullName,
    bookingId,
    amount,
  },
) {
  await client.query(
    `
      UPDATE payouts
      SET status = 'paid',
          transaction_code = $2,
          paid_at = now(),
          paid_by_admin_id = $3
      WHERE id = $1
    `,
    [payoutId, transactionCode, adminId],
  );

  await client.query(
    `
      INSERT INTO transactions (
        transaction_code, type, counterparty_name, amount,
        booking_id, performed_by_admin_id, performed_by_admin_name
      )
      VALUES ($1, 'hostPayout', $2, $3, $4, $5, $6)
    `,
    [transactionCode, hostFullName, amount, bookingId, adminId, adminFullName],
  );
}

// Used by booking.service.js's cancelGuestBooking: a confirmed booking
// being cancelled within the 24h window must void its payout if it's
// still 'due', or block (409) if it's already 'paid'.
export async function findPayoutForBookingForUpdate(client, bookingId) {
  const { rows } = await client.query(
    `
      SELECT id, status
      FROM payouts
      WHERE booking_id = $1
      FOR UPDATE
    `,
    [bookingId],
  );

  return rows[0] ?? null;
}

export async function voidPayout(client, payoutId) {
  await client.query(
    `
      UPDATE payouts
      SET status = 'voided'
      WHERE id = $1
    `,
    [payoutId],
  );
}