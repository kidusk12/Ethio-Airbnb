const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/listings — FR-3.1, FR-3.2 (browse + filter by city/price)
router.get('/', async (req, res) => {
  const { city, minPrice, maxPrice } = req.query;
  const conditions = ["status = 'approved'"];
  const values = [];

  if (city) {
    values.push(`%${city}%`);
    conditions.push(`city ILIKE $${values.length}`);
  }
  if (minPrice) {
    values.push(minPrice);
    conditions.push(`price_per_night >= $${values.length}`);
  }
  if (maxPrice) {
    values.push(maxPrice);
    conditions.push(`price_per_night <= $${values.length}`);
  }

  const query = `SELECT * FROM listings WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch listings.' });
  }
});

// GET /api/listings/:id — FR-3.3 (single listing detail)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Listing not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch listing.' });
  }
});

// GET /api/listings/mine/all — FR-2.3 (host's own listings)
router.get('/mine/all', requireAuth, requireRole('host'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM listings WHERE host_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch your listings.' });
  }
});

// POST /api/listings — FR-2.1 (host creates a listing)
router.post('/', requireAuth, requireRole('host'), async (req, res) => {
  const { title, description, city, pricePerNight, imageUrl } = req.body;

  if (!title || !city || !pricePerNight) {
    return res.status(400).json({ error: 'title, city, and pricePerNight are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO listings (host_id, title, description, city, price_per_night, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, title, description, city, pricePerNight, imageUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create listing.' });
  }
});

// PUT /api/listings/:id — FR-2.2 (host edits their own listing)
router.put('/:id', requireAuth, requireRole('host'), async (req, res) => {
  const { title, description, city, pricePerNight, imageUrl } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Listing not found.' });
    if (existing.rows[0].host_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own listings.' });
    }

    const result = await pool.query(
      `UPDATE listings SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         city = COALESCE($3, city),
         price_per_night = COALESCE($4, price_per_night),
         image_url = COALESCE($5, image_url)
       WHERE id = $6 RETURNING *`,
      [title, description, city, pricePerNight, imageUrl, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update listing.' });
  }
});

// DELETE /api/listings/:id — FR-2.2 (host deletes their own listing)
router.delete('/:id', requireAuth, requireRole('host'), async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Listing not found.' });
    if (existing.rows[0].host_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own listings.' });
    }

    await pool.query('DELETE FROM listings WHERE id = $1', [req.params.id]);
    res.json({ deleted: Number(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete listing.' });
  }
});

module.exports = router;
