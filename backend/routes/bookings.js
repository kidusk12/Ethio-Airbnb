const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const requireAuth = require('../middleware/auth');
const expireIfPastDeadline = require('../utils/expireBooking');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetch a booking by id. Returns null if not found.
 */
async function getBookingById(client, id) {
  const result = await client.query(
    `SELECT b.*, l.price_per_night, l.max_guests, l.title AS listing_title,
            l.host_id,
            (SELECT photos[1] FROM listings WHERE id = b.listing_id) AS cover_photo
     FROM bookings b
     JOIN listings l ON l.id = b.listing_id
     WHERE b.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

// ---------------------------------------------------------------------------
// IMPORTANT: Named paths MUST be registered before /:id routes so Express
// doesn't treat 'availability', 'my-bookings', 'host-bookings' as IDs.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// GET /api/bookings/availability — Auth: none
// ---------------------------------------------------------------------------
router.get('/availability', async (req, res) => {
  try {
    const { listingId, checkIn, checkOut } = req.query;

    if (!listingId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'listingId, checkIn, and checkOut query params are required',
      });
    }

    // Find any pending_payment/confirmed bookings overlapping the range
    const overlapResult = await pool.query(
      `SELECT id, status, payment_deadline
       FROM bookings
       WHERE listing_id = $1
         AND status IN ('pending_payment','confirmed')
         AND check_in  < $3::date
         AND check_out > $2::date`,
      [listingId, checkIn, checkOut]
    );

    // Run expiry on any pending_payment candidates before deciding overlap
    let hasOverlap = false;
    for (const row of overlapResult.rows) {
      const updated = await expireIfPastDeadline(pool, row);
      if (updated.status !== 'cancelled') {
        hasOverlap = true;
        break;
      }
    }

    return res.status(200).json({ success: true, data: { available: !hasOverlap } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/bookings/my-bookings — Auth: guest only
// ---------------------------------------------------------------------------
router.get('/my-bookings', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'guest') {
      return res.status(403).json({ success: false, message: 'Only guests can view their bookings' });
    }

    // Expire all pending_payment bookings for this guest first
    const pendingResult = await pool.query(
      `SELECT id, status, payment_deadline
       FROM bookings
       WHERE guest_id = $1 AND status = 'pending_payment'`,
      [req.user.id]
    );
    for (const row of pendingResult.rows) {
      await expireIfPastDeadline(pool, row);
    }

    // Fetch all bookings with listing info and hasReviewed flag
    const result = await pool.query(
      `SELECT
         b.id,
         b.listing_id         AS "listingId",
         l.title              AS "listingTitle",
         l.cover_photo        AS "coverPhoto",
         b.check_in           AS "checkIn",
         b.check_out          AS "checkOut",
         b.status,
         b.total_price        AS "totalPrice",
         b.payment_deadline   AS "paymentDeadline",
         EXISTS (
           SELECT 1 FROM reviews r WHERE r.booking_id = b.id
         )                    AS "hasReviewed"
       FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       WHERE b.guest_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: { bookings: result.rows } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/bookings/host-bookings — Auth: host only
// ---------------------------------------------------------------------------
router.get('/host-bookings', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({ success: false, message: 'Only hosts can view host bookings' });
    }

    // Expire pending bookings on this host's listings first
    const pendingResult = await pool.query(
      `SELECT b.id, b.status, b.payment_deadline
       FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       WHERE l.host_id = $1 AND b.status = 'pending_payment'`,
      [req.user.id]
    );
    for (const row of pendingResult.rows) {
      await expireIfPastDeadline(pool, row);
    }

    const result = await pool.query(
      `SELECT
         b.id,
         b.listing_id         AS "listingId",
         l.title              AS "listingTitle",
         l.cover_photo        AS "coverPhoto",
         b.check_in           AS "checkIn",
         b.check_out          AS "checkOut",
         b.status,
         b.total_price        AS "totalPrice",
         b.payment_deadline   AS "paymentDeadline",
         u.name               AS "guestName"
       FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       JOIN users u    ON u.id = b.guest_id
       WHERE l.host_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: { bookings: result.rows } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/bookings — Auth: guest only
// ---------------------------------------------------------------------------
router.post('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'guest') {
      return res.status(403).json({ success: false, message: 'Only guests can create bookings' });
    }

    const { listingId, checkIn, checkOut, guestCount } = req.body;

    // --- Validation ---
    const errors = [];
    if (!listingId)  errors.push({ field: 'listingId',  message: 'listingId is required' });
    if (!checkIn)    errors.push({ field: 'checkIn',    message: 'checkIn is required' });
    if (!checkOut)   errors.push({ field: 'checkOut',   message: 'checkOut is required' });
    if (!guestCount) errors.push({ field: 'guestCount', message: 'guestCount is required' });

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      return res.status(400).json({
        success: false,
        message: 'checkOut must be after checkIn',
        errors: [{ field: 'checkOut', message: 'checkOut must be after checkIn' }],
      });
    }

    // --- Lookup listing ---
    const listingResult = await pool.query(
      'SELECT id, price_per_night, max_guests, status, active FROM listings WHERE id = $1',
      [listingId]
    );
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    const listing = listingResult.rows[0];

    if (listing.max_guests && guestCount > listing.max_guests) {
      return res.status(400).json({
        success: false,
        message: `This listing allows a maximum of ${listing.max_guests} guests`,
        errors: [{ field: 'guestCount', message: `Exceeds max guests (${listing.max_guests})` }],
      });
    }

    // --- Compute price server-side (never trust client) ---
    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = parseFloat(listing.price_per_night) * nights;

    // --- Overlap check + insert in one transaction (race-safe) ---
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // FOR UPDATE locks matched rows so concurrent requests wait rather than double-book
      const overlapResult = await client.query(
        `SELECT id FROM bookings
         WHERE listing_id = $1
           AND status IN ('pending_payment','confirmed')
           AND check_in  < $3::date
           AND check_out > $2::date
         FOR UPDATE`,
        [listingId, checkIn, checkOut]
      );

      if (overlapResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: 'These dates are not available — another booking exists for this period',
        });
      }

      const insertResult = await client.query(
        `INSERT INTO bookings
           (listing_id, guest_id, check_in, check_out, guest_count, total_price,
            status, payment_deadline)
         VALUES ($1, $2, $3::date, $4::date, $5, $6,
                 'pending_payment', now() + interval '1 hour')
         RETURNING id, total_price, status, payment_deadline`,
        [listingId, req.user.id, checkIn, checkOut, guestCount, totalPrice]
      );

      await client.query('COMMIT');

      const booking = insertResult.rows[0];
      return res.status(201).json({
        success: true,
        message: 'Booking created — please submit payment receipt within 1 hour',
        data: {
          bookingId:       booking.id,
          totalPrice:      parseFloat(booking.total_price),
          status:          booking.status,
          paymentDeadline: booking.payment_deadline,
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/bookings/:id/payment-receipt — Auth: guest, booking owner only
// ---------------------------------------------------------------------------
router.post('/:id/payment-receipt', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'guest') {
      return res.status(403).json({ success: false, message: 'Only guests can submit payment receipts' });
    }

    // Fetch booking
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [req.params.id]
    );
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    let booking = bookingResult.rows[0];

    // Ownership check → 403 per contract
    if (booking.guest_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not own this booking' });
    }

    // Expire check before acting
    booking = await expireIfPastDeadline(pool, booking);
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Payment deadline has passed' });
    }

    const { receiptImageUrl } = req.body;
    if (!receiptImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'receiptImageUrl is required',
        errors: [{ field: 'receiptImageUrl', message: 'receiptImageUrl is required' }],
      });
    }

    // Always INSERT a new payments row — do not overwrite; resubmission after
    // rejection must create a fresh row (most recent row = active payment).
    const paymentResult = await pool.query(
      `INSERT INTO payments (booking_id, receipt_image_url, status)
       VALUES ($1, $2, 'pending')
       RETURNING id, booking_id, status, submitted_at`,
      [booking.id, receiptImageUrl]
    );
    const payment = paymentResult.rows[0];

    return res.status(201).json({
      success: true,
      data: {
        paymentId:   payment.id,
        bookingId:   payment.booking_id,
        status:      payment.status,
        submittedAt: payment.submitted_at,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/bookings/:id/payment-status — Auth: guest, booking owner only
// ---------------------------------------------------------------------------
router.get('/:id/payment-status', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'guest') {
      return res.status(403).json({ success: false, message: 'Only guests can view payment status' });
    }

    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [req.params.id]
    );
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    let booking = bookingResult.rows[0];

    if (booking.guest_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not own this booking' });
    }

    booking = await expireIfPastDeadline(pool, booking);

    // Most recent payment row
    const paymentResult = await pool.query(
      `SELECT status, submitted_at, confirmed_at
       FROM payments
       WHERE booking_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [booking.id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: { status: null, submittedAt: null, confirmedAt: null },
      });
    }

    const payment = paymentResult.rows[0];
    return res.status(200).json({
      success: true,
      data: {
        status:      payment.status,
        submittedAt: payment.submitted_at,
        confirmedAt: payment.confirmed_at,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/bookings/:id/cancel — Auth: guest, booking owner only
// ---------------------------------------------------------------------------
router.post('/:id/cancel', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'guest') {
      return res.status(403).json({ success: false, message: 'Only guests can cancel bookings' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const bookingResult = await client.query(
        'SELECT * FROM bookings WHERE id = $1 FOR UPDATE',
        [req.params.id]
      );
      if (bookingResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      const booking = bookingResult.rows[0];

      if (booking.guest_id !== req.user.id) {
        await client.query('ROLLBACK');
        return res.status(403).json({ success: false, message: 'You do not own this booking' });
      }

      // Case 1: pending_payment → cancel immediately, no payment/payout touch needed
      if (booking.status === 'pending_payment') {
        await client.query(
          `UPDATE bookings SET status = 'cancelled' WHERE id = $1`,
          [booking.id]
        );
        await client.query('COMMIT');
        return res.status(200).json({ success: true, message: 'Booking cancelled' });
      }

      // Case 2: confirmed and within 24h of payment_confirmed_at
      if (
        booking.status === 'confirmed' &&
        booking.payment_confirmed_at &&
        new Date() < new Date(new Date(booking.payment_confirmed_at).getTime() + 24 * 60 * 60 * 1000)
      ) {
        // Check if payout has already been paid out → block cancel
        const payoutResult = await client.query(
          `SELECT id, status FROM payouts WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1`,
          [booking.id]
        );
        const payout = payoutResult.rows[0];

        if (payout && payout.status === 'paid') {
          await client.query('ROLLBACK');
          return res.status(409).json({
            success: false,
            message: 'Cannot cancel — host payout has already been disbursed',
          });
        }

        // Cancel booking
        await client.query(
          `UPDATE bookings SET status = 'cancelled' WHERE id = $1`,
          [booking.id]
        );

        // Mark most recent payment as refunded
        await client.query(
          `UPDATE payments
           SET status = 'refunded'
           WHERE id = (
             SELECT id FROM payments
             WHERE booking_id = $1
             ORDER BY created_at DESC
             LIMIT 1
           )`,
          [booking.id]
        );

        // Void payout if it's still due
        if (payout && payout.status === 'due') {
          await client.query(
            `UPDATE payouts SET status = 'voided' WHERE id = $1`,
            [payout.id]
          );
        }

        await client.query('COMMIT');
        return res.status(200).json({ success: true, message: 'Booking cancelled and refund initiated' });
      }

      // Case 3: already cancelled or confirmed but window closed
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: booking.status === 'cancelled'
          ? 'Booking is already cancelled'
          : 'Cancellation window has passed (must cancel within 24 hours of payment confirmation)',
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

module.exports = router;