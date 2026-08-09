const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/listings — FR-6.1 (admin views all listings, including non-approved)
router.get('/listings', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM listings ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch listings.' });
  }
});

// GET /api/admin/reviews — FR-6.1
router.get('/reviews', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch reviews.' });
  }
});

// DELETE /api/admin/listings/:id — FR-6.2
router.delete('/listings/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM listings WHERE id = $1', [req.params.id]);
    res.json({ deleted: Number(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete listing.' });
  }
});

// DELETE /api/admin/reviews/:id — FR-6.2
router.delete('/reviews/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ deleted: Number(req.params.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete review.' });
  }
});

module.exports = router;
