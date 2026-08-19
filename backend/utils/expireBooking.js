/**
 * expireIfPastDeadline
 *
 * Given a booking row (must include: id, status, payment_deadline),
 * checks whether the booking is still pending_payment but past its
 * payment deadline. If so, atomically flips:
 *   - bookings.status  → 'cancelled'
 *   - most recent payments row (if any) status → 'expired'
 *
 * The update is done inside a BEGIN/COMMIT transaction so the two
 * writes are never partially visible.
 *
 * Returns the (possibly updated) booking object with the current status.
 * Callers should use the returned object, not the original, to check status.
 *
 * @param {import('pg').Pool} pool
 * @param {object} booking  – row from the bookings table
 * @returns {Promise<object>} updated booking row
 */
async function expireIfPastDeadline(pool, booking) {
  // Only act on pending_payment bookings that are past their deadline
  if (booking.status !== 'pending_payment') return booking;
  if (new Date() <= new Date(booking.payment_deadline)) return booking;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Flip the booking to cancelled
    await client.query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND status = 'pending_payment'`,
      [booking.id]
    );

    // Mark the most recent pending payment row as expired (if one exists)
    await client.query(
      `UPDATE payments
       SET status = 'expired'
       WHERE id = (
         SELECT id FROM payments
         WHERE booking_id = $1
         ORDER BY created_at DESC
         LIMIT 1
       )
       AND status = 'pending'`,
      [booking.id]
    );

    await client.query('COMMIT');

    return { ...booking, status: 'cancelled' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = expireIfPastDeadline;
