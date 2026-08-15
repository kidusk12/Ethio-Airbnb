const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const requireAuth = require('../middleware/auth');

// POST /api/listings  (EA-17 / EA-53 — Host only)
router.post('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({ success: false, message: 'Only hosts can create listings' });
    }

    const { title, description, location, pricePerNight, photos } = req.body;

    const errors = [];
    if (!title) errors.push({ field: 'title', message: 'Title is required' });
    if (!location) errors.push({ field: 'location', message: 'Location is required' });
    if (pricePerNight === undefined || pricePerNight === null || pricePerNight <= 0) {
      errors.push({ field: 'pricePerNight', message: 'Price per night must be greater than 0' });
    }
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const result = await pool.query(
      `INSERT INTO listings (host_id, title, description, location, price_per_night, photos)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [req.user.id, title, description || null, location, pricePerNight, photos || []]
    );

    return res.status(201).json({
      success: true,
      message: 'Listing created',
      data: { id: result.rows[0].id },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong creating the listing' });
  }
});

// GET /api/listings  (EA-18 / EA-59/61 — browse/search, public)
router.get('/', async (req, res) => {
  try {
    const { location, minPrice, maxPrice, checkIn, checkOut } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;

    const conditions = ['active = true'];
    const values = [];

    if (location) {
      values.push(`%${location}%`);
      conditions.push(`location ILIKE $${values.length}`);
    }
    if (minPrice) {
      values.push(minPrice);
      conditions.push(`price_per_night >= $${values.length}`);
    }
    if (maxPrice) {
      values.push(maxPrice);
      conditions.push(`price_per_night <= $${values.length}`);
    }
    if (checkIn && checkOut) {
      // Exclude listings with a confirmed/completed booking overlapping the requested dates
      values.push(checkIn, checkOut);
      conditions.push(`id NOT IN (
        SELECT listing_id FROM bookings
        WHERE status IN ('confirmed', 'completed')
        AND check_in < $${values.length} AND check_out > $${values.length - 1}
      )`);
    }

    const whereClause = conditions.join(' AND ');

    // Must run before values.push(limit, offset) below — the count query needs
    // only the filter values (location/price/date), not pagination params.
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM listings WHERE ${whereClause}`,
      values
    );
    const totalResults = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalResults / limit);

    values.push(limit, offset);
    const listingsResult = await pool.query(
      `SELECT id, title, location, price_per_night, photos, host_id
       FROM listings
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    const listings = listingsResult.rows.map((l) => ({
      id: l.id,
      title: l.title,
      location: l.location,
      pricePerNight: l.price_per_night,
      coverPhoto: l.photos && l.photos.length > 0 ? l.photos[0] : null,
      hostId: l.host_id,
    }));

    return res.status(200).json({
      success: true,
      data: { listings, page, totalPages, totalResults },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong fetching listings' });
  }
});

// GET /api/listings/my-listings  (Host only — must come before GET /:id below,
// otherwise Express matches "my-listings" as an :id value)
router.get('/my-listings', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({ success: false, message: 'Only hosts can view their own listings' });
    }

    const result = await pool.query(
      `SELECT id, title, price_per_night, active
       FROM listings
       WHERE host_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const listings = result.rows.map((l) => ({
      id: l.id,
      title: l.title,
      pricePerNight: l.price_per_night,
      active: l.active,
    }));

    return res.status(200).json({ success: true, data: { listings } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong fetching your listings' });
  }
});

// GET /api/listings/:id  (EA-18 / EA-59 — detail view, public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const listingResult = await pool.query(
      `SELECT l.*, u.name AS host_name
       FROM listings l
       JOIN users u ON u.id = l.host_id
       WHERE l.id = $1`,
      [id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const listing = listingResult.rows[0];

    const reviewStats = await pool.query(
      `SELECT COUNT(*) AS review_count, COALESCE(AVG(rating), 0) AS average_rating
       FROM reviews WHERE listing_id = $1`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        location: listing.location,
        pricePerNight: listing.price_per_night,
        photos: listing.photos || [],
        hostId: listing.host_id,
        hostName: listing.host_name,
        averageRating: parseFloat(reviewStats.rows[0].average_rating),
        reviewCount: parseInt(reviewStats.rows[0].review_count),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong fetching the listing' });
  }
});

// PUT /api/listings/:id  (EA-19 — owner only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT host_id FROM listings WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    if (existing.rows[0].host_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own listings' });
    }

    const { title, description, location, pricePerNight, photos, active } = req.body;

    const fields = [];
    const values = [];

    if (title !== undefined) { values.push(title); fields.push(`title = $${values.length}`); }
    if (description !== undefined) { values.push(description); fields.push(`description = $${values.length}`); }
    if (location !== undefined) { values.push(location); fields.push(`location = $${values.length}`); }
    if (pricePerNight !== undefined) {
      if (pricePerNight <= 0) {
        return res.status(400).json({ success: false, message: 'Price per night must be greater than 0' });
      }
      values.push(pricePerNight); fields.push(`price_per_night = $${values.length}`);
    }
    if (photos !== undefined) { values.push(photos); fields.push(`photos = $${values.length}`); }
    if (active !== undefined) { values.push(active); fields.push(`active = $${values.length}`); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update' });
    }

    values.push(id);
    await pool.query(
      `UPDATE listings SET ${fields.join(', ')} WHERE id = $${values.length}`,
      values
    );

    return res.status(200).json({ success: true, message: 'Listing updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong updating the listing' });
  }
});

// DELETE /api/listings/:id  (EA-20 — owner only, soft delete)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT host_id FROM listings WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    if (existing.rows[0].host_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own listings' });
    }

    // Soft delete: set active = false rather than removing the row.
    // Existing bookings/reviews stay intact, and the listing simply stops
    // appearing in GET /api/listings (which already filters WHERE active = true).
    await pool.query('UPDATE listings SET active = false WHERE id = $1', [id]);

    return res.status(200).json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong deleting the listing' });
  }
});

module.exports = router;