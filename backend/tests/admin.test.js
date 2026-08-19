process.env.JWT_SECRET = 'test-secret';

const express = require('express');
const request = require('supertest');
const jwt     = require('jsonwebtoken');

const db          = require('../config/db');
const adminRouter = require('../routes/admin');

jest.mock('../config/db');

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------
function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRouter);
  return app;
}

const app = makeApp();

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------
function token(role, id = 'user-1') {
  return `Bearer ${jwt.sign({ id, role }, process.env.JWT_SECRET)}`;
}
const adminToken  = token('admin',  'admin-1');
const guestToken  = token('guest',  'guest-1');
const hostToken   = token('host',   'host-1');

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
const ADMIN_USER = { id: 'admin-1', name: 'Admin User', email: 'admin@example.com', role: 'admin' };
const GUEST_USER = { id: 'guest-1', name: 'Guest User', email: 'guest@example.com', role: 'guest' };
const HOST_USER  = { id: 'host-1',  name: 'Host User',  email: 'host@example.com',  role: 'host'  };

const LISTING = {
  id: 'listing-1',
  host_id: 'host-1',
  title: 'Nice Place',
  price_per_night: '100.00',
  max_guests: 4,
  status: 'pending',
  active: true,
  cover_photo: null,
  location: 'Addis Ababa',
};

const BOOKING = {
  id: 'booking-1',
  listing_id: 'listing-1',
  guest_id:   'guest-1',
  check_in:   '2027-01-10',
  check_out:  '2027-01-13',
  guest_count: 2,
  total_price: '300.00',
  status: 'pending_payment',
  payment_deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  payment_confirmed_at: null,
  created_at: new Date().toISOString(),
};

const PAYMENT = {
  id: 'payment-1',
  booking_id: 'booking-1',
  receipt_image_url: 'https://example.com/receipt.jpg',
  status: 'pending',
  submitted_at: new Date().toISOString(),
  created_at:   new Date().toISOString(),
  confirmed_at: null,
  transaction_code: null,
  rejection_reason: null,
  // Joined fields used by confirm/reject routes
  booking_status:   'pending_payment',
  payment_deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  total_price:      '300.00',
  listing_id:       'listing-1',
  guest_id:         'guest-1',
  booking_id_field: 'booking-1',
};

beforeEach(() => {
  db.__reset();
});

// ===========================================================================
// Role guard — every admin route must 403 non-admin callers
// ===========================================================================
describe('Admin role guard', () => {
  const adminRoutes = [
    { method: 'get',    path: '/api/admin/listings/pending' },
    { method: 'get',    path: '/api/admin/listings' },
    { method: 'get',    path: '/api/admin/payments/pending' },
    { method: 'get',    path: '/api/admin/payouts/due' },
    { method: 'get',    path: '/api/admin/transactions' },
    { method: 'get',    path: '/api/admin/reviews' },
    { method: 'post',   path: '/api/admin/listings/listing-1/approve' },
    { method: 'post',   path: '/api/admin/listings/listing-1/reject' },
    { method: 'post',   path: '/api/admin/payments/payment-1/confirm' },
    { method: 'post',   path: '/api/admin/payments/payment-1/reject' },
    { method: 'post',   path: '/api/admin/payouts/payout-1/mark-paid' },
    { method: 'delete', path: '/api/admin/listings/listing-1' },
    { method: 'delete', path: '/api/admin/reviews/review-1' },
  ];

  test.each(adminRoutes)('403 for guest on $method $path', async ({ method, path }) => {
    const res = await request(app)[method](path).set('Authorization', guestToken).send({});
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test.each(adminRoutes)('403 for host on $method $path', async ({ method, path }) => {
    const res = await request(app)[method](path).set('Authorization', hostToken).send({});
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test.each(adminRoutes)('401 for unauthenticated on $method $path', async ({ method, path }) => {
    const res = await request(app)[method](path).send({});
    expect(res.status).toBe(401);
  });
});

// ===========================================================================
// GET /api/admin/listings/pending
// ===========================================================================
describe('GET /api/admin/listings/pending', () => {
  test('200 returns empty list when no pending listings', async () => {
    const res = await request(app)
      .get('/api/admin/listings/pending')
      .set('Authorization', adminToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.listings)).toBe(true);
  });
});

// ===========================================================================
// POST /api/admin/listings/:id/approve
// ===========================================================================
describe('POST /api/admin/listings/:id/approve', () => {
  test('200 approves a listing', async () => {
    db.__seed({ listings: [LISTING], users: [ADMIN_USER] });
    const res = await request(app)
      .post('/api/admin/listings/listing-1/approve')
      .set('Authorization', adminToken);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('approved');
  });

  test('404 when listing does not exist', async () => {
    const res = await request(app)
      .post('/api/admin/listings/nonexistent/approve')
      .set('Authorization', adminToken);
    expect(res.status).toBe(404);
  });
});

// ===========================================================================
// POST /api/admin/listings/:id/reject
// ===========================================================================
describe('POST /api/admin/listings/:id/reject', () => {
  test('200 rejects a listing with optional reason', async () => {
    db.__seed({ listings: [LISTING], users: [ADMIN_USER] });
    const res = await request(app)
      .post('/api/admin/listings/listing-1/reject')
      .set('Authorization', adminToken)
      .send({ reason: 'Invalid deed document' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('rejected');
  });

  test('200 rejects without a reason (reason is optional)', async () => {
    db.__seed({ listings: [LISTING], users: [ADMIN_USER] });
    const res = await request(app)
      .post('/api/admin/listings/listing-1/reject')
      .set('Authorization', adminToken)
      .send({});
    expect(res.status).toBe(200);
  });
});

// ===========================================================================
// POST /api/admin/payments/:id/confirm
// ===========================================================================
describe('POST /api/admin/payments/:id/confirm', () => {
  test('400 when transactionCode is missing', async () => {
    db.__seed({ users: [ADMIN_USER, GUEST_USER, HOST_USER], listings: [LISTING], bookings: [BOOKING], payments: [PAYMENT] });
    const res = await request(app)
      .post('/api/admin/payments/payment-1/confirm')
      .set('Authorization', adminToken)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'transactionCode' })])
    );
  });

  test('400 when transactionCode is whitespace-only', async () => {
    const res = await request(app)
      .post('/api/admin/payments/payment-1/confirm')
      .set('Authorization', adminToken)
      .send({ transactionCode: '   ' });
    expect(res.status).toBe(400);
  });

  test('404 when payment does not exist', async () => {
    const res = await request(app)
      .post('/api/admin/payments/nonexistent/confirm')
      .set('Authorization', adminToken)
      .send({ transactionCode: 'TXN-001' });
    expect(res.status).toBe(404);
  });

  test('400 when payment deadline has passed', async () => {
    const EXPIRED_BOOKING = {
      ...BOOKING,
      payment_deadline: new Date(Date.now() - 5000).toISOString(),
    };
    const EXPIRED_PAYMENT = {
      ...PAYMENT,
      payment_deadline: EXPIRED_BOOKING.payment_deadline,
      booking_status:   'pending_payment',
      total_price:      BOOKING.total_price,
      listing_id:       BOOKING.listing_id,
      guest_id:         BOOKING.guest_id,
      booking_id:       BOOKING.id,
    };

    // The confirm route does pool.query() (not client) for the initial JOIN load.
    // Patch db.query to intercept the JOIN pattern and return our expired row.
    const origQuery = db.query.bind(db);
    db.query = async (sql, params = []) => {
      const n = sql.trim().replace(/\s+/g, ' ').toLowerCase();
      if (n.includes('select p.*') && n.includes('from payments p') && n.includes('where p.id = $1')) {
        return { rows: [EXPIRED_PAYMENT] };
      }
      return origQuery(sql, params);
    };

    const res = await request(app)
      .post('/api/admin/payments/payment-1/confirm')
      .set('Authorization', adminToken)
      .send({ transactionCode: 'TXN-001' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/deadline/i);

    db.query = origQuery;
  });
});

// ===========================================================================
// POST /api/admin/payments/:id/reject
// ===========================================================================
describe('POST /api/admin/payments/:id/reject', () => {
  test('200 rejects a payment with optional reason', async () => {
    // The reject route loads payment via pool.query() with a JOIN.
    // Seed the in-memory tables so the mock's JOIN catch-all can serve it.
    db.__seed({ users: [ADMIN_USER, GUEST_USER, HOST_USER], listings: [LISTING], bookings: [BOOKING], payments: [PAYMENT] });

    const FULL_PAYMENT = {
      ...PAYMENT,
      booking_status: 'pending_payment',
      booking_id: BOOKING.id,
    };

    const origQuery = db.query.bind(db);
    db.query = async (sql, params = []) => {
      const n = sql.trim().replace(/\s+/g, ' ').toLowerCase();
      if (n.includes('select p.*') && n.includes('from payments p') && n.includes('where p.id = $1')) {
        const [id] = params;
        if (id === 'payment-1') return { rows: [FULL_PAYMENT] };
        return { rows: [] };
      }
      return origQuery(sql, params);
    };

    const res = await request(app)
      .post('/api/admin/payments/payment-1/reject')
      .set('Authorization', adminToken)
      .send({ reason: 'Blurry image' });

    expect(res.status).toBe(200);
    db.query = origQuery;
  });

  test('404 when payment does not exist', async () => {
    const res = await request(app)
      .post('/api/admin/payments/nonexistent/reject')
      .set('Authorization', adminToken)
      .send({});
    expect(res.status).toBe(404);
  });
});

// ===========================================================================
// POST /api/admin/payouts/:id/mark-paid
// ===========================================================================
describe('POST /api/admin/payouts/:id/mark-paid', () => {
  test('400 when transactionCode is missing', async () => {
    const res = await request(app)
      .post('/api/admin/payouts/payout-1/mark-paid')
      .set('Authorization', adminToken)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'transactionCode' })])
    );
  });

  test('400 when transactionCode is whitespace-only', async () => {
    const res = await request(app)
      .post('/api/admin/payouts/payout-1/mark-paid')
      .set('Authorization', adminToken)
      .send({ transactionCode: '   ' });
    expect(res.status).toBe(400);
  });

  test('404 when payout does not exist', async () => {
    const res = await request(app)
      .post('/api/admin/payouts/nonexistent/mark-paid')
      .set('Authorization', adminToken)
      .send({ transactionCode: 'TXN-002' });
    expect(res.status).toBe(404);
  });
});

// ===========================================================================
// GET /api/admin/transactions
// ===========================================================================
describe('GET /api/admin/transactions', () => {
  test('200 returns transactions array', async () => {
    const res = await request(app)
      .get('/api/admin/transactions')
      .set('Authorization', adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.transactions)).toBe(true);
  });
});

// ===========================================================================
// GET /api/admin/reviews + DELETE /api/admin/reviews/:id
// ===========================================================================
describe('Admin reviews moderation', () => {
  test('GET /reviews returns 200 with reviews array', async () => {
    const res = await request(app)
      .get('/api/admin/reviews')
      .set('Authorization', adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.reviews)).toBe(true);
  });

  test('DELETE /reviews/:id returns 404 for nonexistent review', async () => {
    const res = await request(app)
      .delete('/api/admin/reviews/nonexistent')
      .set('Authorization', adminToken);
    expect(res.status).toBe(404);
  });
});
