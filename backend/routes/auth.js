const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // adjust path to match this repo's actual db pool module
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
// NOTE: registration logic is out of scope for this ticket (EA-15). This stub
// assumes the EA-14 implementation already exists on this branch after the
// port/cherry-pick — do not modify its hashing logic per the ticket's

router.post('/register', async (req, res) => {
  // Ported as-is from EA-14-user-registration. Do not change.
  return res.status(501).json({ success: false, message: 'Not ported in this snippet — copy the real handler from EA-14' });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Build the response object field-by-field so password_hash (or any future
    // column added to users) can never leak by accident.
    const userResponse = { id: user.id, name: user.name, email: user.email, role: user.role };

    return res.status(200).json({ success: true, data: { user: userResponse, token } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong during login' });
  }
});

// POST /api/auth/logout
// Stateless JWT — there's no server-side session to invalidate. This exists
// so the frontend has a consistent endpoint to hit; it always succeeds and
// the client is responsible for discarding its token.
router.post('/logout', (req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Missing or invalid token' });
    }

    const user = result.rows[0];
    return res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

module.exports = router;