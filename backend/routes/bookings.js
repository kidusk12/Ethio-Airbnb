const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings — FR-4.1, FR-4.2, FR-4.3 (guest requests a booking, no overlap allowed)
router.post('/', requireAuth, requireRole('guest'), async (req, res) => {
  const { listingId, startDate, endDate } = req.body;

  if (!listingId || !startDate || !endDate) {
    return res.status(400).json({ error: 'listingId, startDate, and endDate are required.' });
  }
  if (new Date(endDate) <= new Date(startDate)) {
    return res.status(400).json({ error: 'endDate must be after startDate.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // FR-4.2 — check for any existing confirmed/pending booking that overlaps these dates
    const overlapCheck = await client.query(
      `SELECT id FROM bookings
       WHERE listing_id = $1
         AND status != 'cancelled'
         AND start_date < $3
         AND end_date > $2`,
      [listingId, startDate, endDate]
    );

    if (overlapCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'These dates are already booked for this listing.' });
    }

    // FR-4.3 — simulated payment step: we just mark it confirmed directly (no real gateway)
    const result = await client.query(
      `INSERT INTO bookings (listing_id, guest_id, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, 'confirmed') RETURNING *`,
      [listingId, req.user.id, startDate, endDate]
    );

    await client.query('COMMIT');
    res.status(201).json({ ...result.rows[0], paymentSimulated: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Could not create booking.' });
  } finally {
    client.release();
  }
});

// GET /api/bookings/mine — guest's own booking history
router.get('/mine', requireAuth, requireRole('guest'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bookings.*, listings.title, listings.city
       FROM bookings JOIN listings ON bookings.listing_id = listings.id
       WHERE guest_id = $1 ORDER BY bookings.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch your bookings.' });
  }
});

// GET /api/bookings/host — FR-4.4 (host views bookings on their listings)
router.get('/host', requireAuth, requireRole('host'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bookings.*, listings.title
       FROM bookings
       JOIN listings ON bookings.listing_id = listings.id
       WHERE listings.host_id = $1
       ORDER BY bookings.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch bookings.' });
  }
});

// PATCH /api/bookings/:id/cancel — guest cancels their own booking
router.patch('/:id/cancel', requireAuth, requireRole('guest'), async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Booking not found.' });
    if (existing.rows[0].guest_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only cancel your own bookings.' });
    }

    const result = await pool.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not cancel booking.' });
  }
});

module.exports = router;
