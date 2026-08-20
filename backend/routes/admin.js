const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const requireAuth = require('../middleware/auth');
const expireIfPastDeadline = require('../utils/expireBooking');

// ---------------------------------------------------------------------------
// Commission rate — single named constant; change here and nowhere else.
// Per contract open decision: admin keeps 15%, host receives 85%.
// ---------------------------------------------------------------------------
const COMMISSION_RATE = 0.15;

// ---------------------------------------------------------------------------
// Guard: every route in this file requires authentication + admin role.
// Applied per-route (not router-level) so the 401/403 distinction is clear.
// ---------------------------------------------------------------------------
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

// ---------------------------------------------------------------------------
// LISTING APPROVALS
// ---------------------------------------------------------------------------

// GET /api/admin/listings/pending — pending listings with host info
// NOTE: must be registered before /:id routes to avoid param collision
router.get('/listings/pending', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         l.id,
         l.title,
         l.description,
         l.location,
         l.city,
         l.sub_city,
         l.street_address,
         l.category,
         l.bedrooms,
         l.bathrooms,
         l.max_guests,
         l.house_rules,
         l.price_per_night  AS "pricePerNight",
         l.cover_photo      AS "coverPhoto",
         l.photos,
         l.house_deed_photo_url AS "houseDeedPhotoUrl",
         l.status,
         l.created_at       AS "createdAt",
         u.id               AS "hostId",
         u.name             AS "hostName",
         u.email            AS "hostEmail",
         u.id_document_url  AS "hostIdDocumentUrl"
       FROM listings l
       JOIN users u ON u.id = l.host_id
       WHERE l.status = 'pending'
       ORDER BY l.created_at ASC`
    );
    return res.status(200).json({ success: true, data: { listings: result.rows } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// POST /api/admin/listings/:id/approve
router.post('/listings/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE listings
       SET status = 'approved', approved_by_admin_id = $1
       WHERE id = $2
       RETURNING id, status`,
      [req.user.id, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Listing approved',
      data: { listingId: result.rows[0].id, status: result.rows[0].status },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// POST /api/admin/listings/:id/reject
router.post('/listings/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await pool.query(
      `UPDATE listings
       SET status = 'rejected',
           rejected_by_admin_id = $1,
           rejection_reason = $2
       WHERE id = $3
       RETURNING id, status`,
      [req.user.id, reason || null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Listing rejected',
      data: { listingId: result.rows[0].id, status: result.rows[0].status },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ---------------------------------------------------------------------------
// GENERAL LISTING MODERATION
// ---------------------------------------------------------------------------

// GET /api/admin/listings — all listings any status
router.get('/listings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         l.id, l.title, l.status, l.active,
         l.price_per_night AS "pricePerNight",
         l.cover_photo     AS "coverPhoto",
         l.location,
         l.created_at      AS "createdAt",
         u.name            AS "hostName",
         u.id              AS "hostId"
       FROM listings l
       JOIN users u ON u.id = l.host_id
       ORDER BY l.created_at DESC`
    );
    return res.status(200).json({ success: true, data: { listings: result.rows } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// DELETE /api/admin/listings/:id — soft-delete (active = false)
// NOTE FOR listings.js dev: This uses active=false to match the existing schema
// column. If listings.js uses hard DELETE instead, align both here and there.
router.delete('/listings/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE listings SET active = false WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    return res.status(200).json({ success: true, message: 'Listing removed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ---------------------------------------------------------------------------
// PAYMENTS
// ---------------------------------------------------------------------------

// GET /api/admin/payments/pending
// Expires stale pending_payment bookings first, then returns pending payment rows.
router.get('/payments/pending', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Expire all stale pending_payment bookings that have outstanding payments
    const staleResult = await pool.query(
      `SELECT DISTINCT b.id, b.status, b.payment_deadline
       FROM bookings b
       JOIN payments p ON p.booking_id = b.id
       WHERE b.status = 'pending_payment'
         AND p.status = 'pending'`
    );
    for (const row of staleResult.rows) {
      await expireIfPastDeadline(pool, row);
    }

    // Return bookings that still have a pending payment after expiry sweep
    const result = await pool.query(
      `SELECT
         p.id                 AS "paymentId",
         p.receipt_image_url  AS "receiptImageUrl",
         p.submitted_at       AS "submittedAt",
         b.id                 AS "bookingId",
         b.payment_deadline   AS "paymentDeadline",
         b.total_price        AS "totalPrice",
         l.title              AS "propertyTitle",
         guest.name           AS "guestName",
         host.name            AS "hostName"
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       JOIN listings l ON l.id = b.listing_id
       JOIN users guest ON guest.id = b.guest_id
       JOIN users host  ON host.id  = l.host_id
       WHERE p.status = 'pending'
         AND b.status = 'pending_payment'
         AND p.id = (
           SELECT id FROM payments
           WHERE booking_id = b.id
           ORDER BY created_at DESC
           LIMIT 1
         )
       ORDER BY p.submitted_at ASC`
    );

    return res.status(200).json({ success: true, data: { payments: result.rows } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// POST /api/admin/payments/:id/confirm — :id is a payment id
router.post('/payments/:id/confirm', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { transactionCode } = req.body;
    if (!transactionCode || !transactionCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'transactionCode is required',
        errors: [{ field: 'transactionCode', message: 'transactionCode is required' }],
      });
    }

    // Load the payment and its booking
    const paymentResult = await pool.query(
      `SELECT p.*, b.status AS booking_status, b.payment_deadline,
              b.total_price, b.listing_id, b.guest_id, b.id AS booking_id
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    const payment = paymentResult.rows[0];

    // Check booking deadline
    if (new Date() > new Date(payment.payment_deadline)) {
      return res.status(400).json({ success: false, message: 'Payment deadline has passed' });
    }

    // Load guest name, host id, host name for transaction log
    const guestResult = await pool.query('SELECT name FROM users WHERE id = $1', [payment.guest_id]);
    const listingResult = await pool.query('SELECT host_id FROM listings WHERE id = $1', [payment.listing_id]);
    const hostId = listingResult.rows[0].host_id;
    const hostResult = await pool.query('SELECT name FROM users WHERE id = $1', [hostId]);
    const adminResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);

    const guestName = guestResult.rows[0].name;
    const hostName  = hostResult.rows[0].name;
    const adminName = adminResult.rows[0].name;
    const totalPrice = parseFloat(payment.total_price);
    const payoutAmount = totalPrice * (1 - COMMISSION_RATE);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Confirm payment
      await client.query(
        `UPDATE payments
         SET status = 'confirmed', transaction_code = $1, confirmed_at = now()
         WHERE id = $2`,
        [transactionCode.trim(), payment.id]
      );

      // 2. Confirm booking + record when payment was confirmed (for 24h cancel window)
      await client.query(
        `UPDATE bookings
         SET status = 'confirmed', payment_confirmed_at = now()
         WHERE id = $1`,
        [payment.booking_id]
      );

      // 3. Insert payout row (due)
      await client.query(
        `INSERT INTO payouts
           (booking_id, host_id, amount, status, payment_confirmed_at)
         VALUES ($1, $2, $3, 'due', now())`,
        [payment.booking_id, hostId, payoutAmount]
      );

      // 4. Insert transaction audit log (userPayment)
      await client.query(
        `INSERT INTO transactions
           (transaction_code, type, booking_id, counterparty_name,
            amount, performed_by_admin_id, performed_by_admin_name)
         VALUES ($1, 'userPayment', $2, $3, $4, $5, $6)`,
        [transactionCode.trim(), payment.booking_id, guestName,
         totalPrice, req.user.id, adminName]
      );

      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: 'Payment confirmed and booking activated',
        data: { payoutAmount },
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

// POST /api/admin/payments/:id/reject
router.post('/payments/:id/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;

    const paymentResult = await pool.query(
      `SELECT p.*, b.id AS booking_id
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    const payment = paymentResult.rows[0];

    await pool.query(
      `UPDATE payments
       SET status = 'rejected', rejection_reason = $1
       WHERE id = $2`,
      [reason || null, payment.id]
    );

    await pool.query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1`,
      [payment.booking_id]
    );

    return res.status(200).json({ success: true, message: 'Payment rejected and booking cancelled' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ---------------------------------------------------------------------------
// PAYOUTS
// ---------------------------------------------------------------------------

// GET /api/admin/payouts/due
// NOTE: registered before /:id to avoid param collision with mark-paid
router.get('/payouts/due', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         po.id,
         po.amount,
         po.status,
         po.payment_confirmed_at  AS "paymentConfirmedAt",
         po.created_at            AS "createdAt",
         b.id                     AS "bookingId",
         l.title                  AS "listingTitle",
         u.id                     AS "hostId",
         u.name                   AS "hostName"
       FROM payouts po
       JOIN bookings b ON b.id = po.booking_id
       JOIN listings l ON l.id = b.listing_id
       JOIN users    u ON u.id = po.host_id
       WHERE po.status = 'due'
       ORDER BY po.payment_confirmed_at ASC`
    );
    return res.status(200).json({ success: true, data: { payouts: result.rows } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// POST /api/admin/payouts/:id/mark-paid
router.post('/payouts/:id/mark-paid', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { transactionCode } = req.body;
    if (!transactionCode || !transactionCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'transactionCode is required',
        errors: [{ field: 'transactionCode', message: 'transactionCode is required' }],
      });
    }

    // Load payout with host and booking info
    const payoutResult = await pool.query(
      `SELECT po.*, u.name AS host_name, b.id AS booking_id
       FROM payouts po
       JOIN users    u ON u.id = po.host_id
       JOIN bookings b ON b.id = po.booking_id
       WHERE po.id = $1`,
      [req.params.id]
    );
    if (payoutResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payout not found' });
    }
    const payout = payoutResult.rows[0];

    if (payout.status !== 'due') {
      return res.status(400).json({
        success: false,
        message: `Payout is already ${payout.status} — cannot mark as paid`,
      });
    }

    const adminResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
    const adminName = adminResult.rows[0].name;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Mark payout paid
      await client.query(
        `UPDATE payouts
         SET status = 'paid', transaction_code = $1, paid_at = now()
         WHERE id = $2`,
        [transactionCode.trim(), payout.id]
      );

      // 2. Insert transaction audit log (hostPayout)
      await client.query(
        `INSERT INTO transactions
           (transaction_code, type, booking_id, counterparty_name,
            amount, performed_by_admin_id, performed_by_admin_name)
         VALUES ($1, 'hostPayout', $2, $3, $4, $5, $6)`,
        [transactionCode.trim(), payout.booking_id, payout.host_name,
         parseFloat(payout.amount), req.user.id, adminName]
      );

      await client.query('COMMIT');

      return res.status(200).json({ success: true, message: 'Payout marked as paid' });
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
// TRANSACTION LOG
// ---------------------------------------------------------------------------

// GET /api/admin/transactions — read-only, newest first, no writes possible
router.get('/transactions', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         t.id,
         t.transaction_code         AS "transactionCode",
         t.type,
         t.booking_id               AS "bookingId",
         t.counterparty_name        AS "counterpartyName",
         t.amount,
         t.performed_by_admin_id    AS "performedByAdminId",
         t.performed_by_admin_name  AS "performedByAdminName",
         t.created_at               AS "createdAt"
       FROM transactions t
       ORDER BY t.created_at DESC`
    );
    return res.status(200).json({ success: true, data: { transactions: result.rows } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ---------------------------------------------------------------------------
// REVIEWS MODERATION
// ---------------------------------------------------------------------------

// GET /api/admin/reviews
router.get('/reviews', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         r.id,
         r.rating,
         r.text,
         r.created_at  AS "createdAt",
         r.listing_id  AS "listingId",
         l.title       AS "listingTitle",
         r.guest_id    AS "guestId",
         u.name        AS "guestName",
         r.booking_id  AS "bookingId"
       FROM reviews r
       JOIN listings l ON l.id = r.listing_id
       JOIN users    u ON u.id = r.guest_id
       ORDER BY r.created_at DESC`
    );
    return res.status(200).json({ success: true, data: { reviews: result.rows } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM reviews WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    return res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

module.exports = router;