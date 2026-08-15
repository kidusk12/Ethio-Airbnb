const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const requireAuth = require('../middleware/auth');

// GET /api/auth/me  (protected)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Missing or invalid token' });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// POST /api/auth/register  (EA-14 / EA-36)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const errors = [];
    if (!name) errors.push({ field: 'name', message: 'Name is required' });
    if (!email) errors.push({ field: 'email', message: 'Email is required' });
    if (!password || password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }
    if (!role || !['guest', 'host'].includes(role)) {
      errors.push({ field: 'role', message: 'Role must be "guest" or "host"' });
    }
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
        errors: [{ field: 'email', message: 'Email is already registered' }],
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, password_hash, role]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ success: true, message: 'Account created', data: { user, token } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong during registration' });
  }
});

// POST /api/auth/login  (EA-15 / EA-42)
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

    const userResponse = { id: user.id, name: user.name, email: user.email, role: user.role };

    return res.status(200).json({ success: true, data: { user: userResponse, token } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong during login' });
  }
});

// POST /api/auth/logout  (EA-16 / EA-49)
router.post('/logout', async (req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;