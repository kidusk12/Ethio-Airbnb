const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews/listing/:listingId — FR-5.2 (shown on listing detail page)
router.get('/listing/:listingId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT reviews.*, users.name AS guest_name
       FROM reviews JOIN users ON reviews.guest_id = users.id
       WHERE listing_id = $1 ORDER BY reviews.created_at DESC`,
      [req.params.listingId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch reviews.' });
  }
});

// POST /api/reviews — FR-5.1 (guest leaves a rating + review)
router.post('/', requireAuth, requireRole('guest'), async (req, res) => {
  const { listingId, rating, comment } = req.body;

  if (!listingId || !rating) {
    return res.status(400).json({ error: 'listingId and rating are required.' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be between 1 and 5.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reviews (listing_id, guest_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [listingId, req.user.id, rating, comment || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not submit review.' });
  }
});

module.exports = router;
