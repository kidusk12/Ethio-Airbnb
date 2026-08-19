process.env.JWT_SECRET = 'test-secret';

const express = require('express');
const request = require('supertest');
const jwt     = require('jsonwebtoken');

const db            = require('../config/db');
const bookingsRouter = require('../routes/bookings');

jest.mock('../config/db');

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------
function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/bookings', bookingsRouter);
  return app;
}

const app = makeApp();

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------
function token(role, id = 'user-1') {
  return `Bearer ${jwt.sign({ id, role }, process.env.JWT_SECRET)}`;
}
const guestToken  = token('guest',  'guest-1');
const guest2Token = token('guest',  'guest-2');
const hostToken   = token('host',   'host-1');
const adminToken  = token('admin',  'admin-1');

// ---------------------------------------------------------------------------
// Seed helpers
// ---------------------------------------------------------------------------
const LISTING = {
  id: 'listing-1',
  host_id: 'host-1',
  title: 'Nice Place',
  price_per_night: '100.00',
  max_guests: 4,
  status: 'approved',
  active: true,
  cover_photo: null,
};

const BOOKING_PENDING = {
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

const BOOKING_EXPIRED = {
  ...BOOKING_PENDING,
  id: 'booking-expired',
  payment_deadline: new Date(Date.now() - 5000).toISOString(), // past deadline
};

const BOOKING_CONFIRMED = {
  ...BOOKING_PENDING,
  id: 'booking-confirmed',
  status: 'confirmed',
  payment_confirmed_at: new Date(Date.now() - 60 * 1000).toISOString(), // confirmed 1 min ago
};

const BOOKING_CONFIRMED_OLD = {
  ...BOOKING_CONFIRMED,
  id: 'booking-confirmed-old',
  payment_confirmed_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25h ago → window closed
};

beforeEach(() => {
  db.__reset();
});

// ===========================================================================
// GET /api/bookings/availability
// ===========================================================================
describe('GET /api/bookings/availability', () => {
  test('400 when query params missing', async () => {
    const res = await request(app).get('/api/bookings/availability');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('200 available=true when no overlapping bookings', async () => {
    db.__seed({ listings: [LISTING] });
    const res = await request(app).get('/api/bookings/availability')
      .query({ listingId: 'listing-1', checkIn: '2027-02-01', checkOut: '2027-02-05' });
    expect(res.status).toBe(200);
    expect(res.body.data.available).toBe(true);
  });

  test('200 available=false when overlapping confirmed booking exists', async () => {
    db.__seed({ listings: [LISTING], bookings: [BOOKING_CONFIRMED] });
    const res = await request(app).get('/api/bookings/availability')
      .query({ listingId: 'listing-1', checkIn: '2027-01-11', checkOut: '2027-01-14' });
    expect(res.status).toBe(200);
    expect(res.body.data.available).toBe(false);
  });

  test('200 available=true when only booking is pending_payment but past deadline (expired)', async () => {
    db.__seed({ listings: [LISTING], bookings: [BOOKING_EXPIRED] });
    const res = await request(app).get('/api/bookings/availability')
      .query({ listingId: 'listing-1', checkIn: '2027-01-11', checkOut: '2027-01-14' });
    expect(res.status).toBe(200);
    // After expiry the booking is cancelled, so dates should be free
    expect(res.body.data.available).toBe(true);
  });
});

// ===========================================================================
// POST /api/bookings
// ===========================================================================
describe('POST /api/bookings', () => {
  beforeEach(() => {
    db.__seed({ listings: [LISTING] });
  });

  test('201 creates a booking for a guest', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', guestToken)
      .send({ listingId: 'listing-1', checkIn: '2027-03-01', checkOut: '2027-03-04', guestCount: 2 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      status: 'pending_payment',
      totalPrice: 300,          // 3 nights × 100
    });
    expect(res.body.data.bookingId).toBeDefined();
    expect(res.body.data.paymentDeadline).toBeDefined();
  });

  test('400 when required fields missing', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', guestToken)
      .send({ listingId: 'listing-1' });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('400 when checkOut is not after checkIn', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', guestToken)
      .send({ listingId: 'listing-1', checkIn: '2027-03-05', checkOut: '2027-03-01', guestCount: 2 });
    expect(res.status).toBe(400);
  });

  test('400 when guestCount exceeds max_guests', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', guestToken)
      .send({ listingId: 'listing-1', checkIn: '2027-03-01', checkOut: '2027-03-04', guestCount: 99 });
    expect(res.status).toBe(400);
  });

  test('404 when listing does not exist', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', guestToken)
      .send({ listingId: 'nonexistent', checkIn: '2027-03-01', checkOut: '2027-03-04', guestCount: 2 });
    expect(res.status).toBe(404);
  });

  test('403 when caller is not a guest', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', hostToken)
      .send({ listingId: 'listing-1', checkIn: '2027-03-01', checkOut: '2027-03-04', guestCount: 2 });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('401 when no token', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ listingId: 'listing-1', checkIn: '2027-03-01', checkOut: '2027-03-04', guestCount: 2 });
    expect(res.status).toBe(401);
  });

  // --- Overlap/409 race ---
  test('409 when overlapping confirmed booking exists for the same listing and dates', async () => {
    db.__seed({ listings: [LISTING], bookings: [BOOKING_CONFIRMED] });
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', guestToken)
      .send({ listingId: 'listing-1', checkIn: '2027-01-11', checkOut: '2027-01-14', guestCount: 2 });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('409 when overlapping pending_payment booking exists', async () => {
    db.__seed({ listings: [LISTING], bookings: [BOOKING_PENDING] });
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', guest2Token)
      .send({ listingId: 'listing-1', checkIn: '2027-01-11', checkOut: '2027-01-14', guestCount: 1 });
    expect(res.status).toBe(409);
  });

  test('201 succeeds on non-overlapping dates even when other bookings exist', async () => {
    db.__seed({ listings: [LISTING], bookings: [BOOKING_CONFIRMED] });
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', guestToken)
      .send({ listingId: 'listing-1', checkIn: '2027-02-01', checkOut: '2027-02-05', guestCount: 2 });
    expect(res.status).toBe(201);
  });
});

// ===========================================================================
// POST /api/bookings/:id/payment-receipt
// ===========================================================================
describe('POST /api/bookings/:id/payment-receipt', () => {
  beforeEach(() => {
    db.__seed({ listings: [LISTING], bookings: [BOOKING_PENDING] });
  });

  test('201 inserts a new payment row', async () => {
    const res = await request(app)
      .post('/api/bookings/booking-1/payment-receipt')
      .set('Authorization', guestToken)
      .send({ receiptImageUrl: 'https://example.com/receipt.jpg' });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.paymentId).toBeDefined();
  });

  test('payment resubmission after rejection creates a NEW row, not overwrite', async () => {
    const REJECTED_PAYMENT = {
      id: 'payment-rejected',
      booking_id: 'booking-1',
      receipt_image_url: 'https://example.com/old.jpg',
      status: 'rejected',
      submitted_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 60000).toISOString(),
      confirmed_at: null,
      transaction_code: null,
      rejection_reason: 'Bad image',
    };
    db.__seed({ listings: [LISTING], bookings: [BOOKING_PENDING], payments: [REJECTED_PAYMENT] });

    const before = db.__payments().length;

    const res = await request(app)
      .post('/api/bookings/booking-1/payment-receipt')
      .set('Authorization', guestToken)
      .send({ receiptImageUrl: 'https://example.com/new.jpg' });

    expect(res.status).toBe(201);
    // A brand-new row must have been inserted, not the old one updated
    expect(db.__payments().length).toBe(before + 1);
    const newPayment = db.__payments()[db.__payments().length - 1];
    expect(newPayment.id).not.toBe('payment-rejected');
    expect(newPayment.status).toBe('pending');
  });

  test('400 when booking deadline has passed', async () => {
    db.__seed({ listings: [LISTING], bookings: [BOOKING_EXPIRED] });
    const res = await request(app)
      .post('/api/bookings/booking-expired/payment-receipt')
      .set('Authorization', guestToken)
      .send({ receiptImageUrl: 'https://example.com/receipt.jpg' });
    expect(res.status).toBe(400);
  });

  test('403 when caller does not own the booking', async () => {
    const res = await request(app)
      .post('/api/bookings/booking-1/payment-receipt')
      .set('Authorization', guest2Token)
      .send({ receiptImageUrl: 'https://example.com/receipt.jpg' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('404 when booking does not exist', async () => {
    const res = await request(app)
      .post('/api/bookings/nonexistent/payment-receipt')
      .set('Authorization', guestToken)
      .send({ receiptImageUrl: 'https://example.com/receipt.jpg' });
    expect(res.status).toBe(404);
  });
});

// ===========================================================================
// GET /api/bookings/:id/payment-status
// ===========================================================================
describe('GET /api/bookings/:id/payment-status', () => {
  const PAYMENT = {
    id: 'payment-1',
    booking_id: 'booking-1',
    receipt_image_url: 'https://example.com/receipt.jpg',
    status: 'pending',
    submitted_at: new Date().toISOString(),
    created_at:   new Date().toISOString(),
    confirmed_at: null,
  };

  beforeEach(() => {
    db.__seed({ listings: [LISTING], bookings: [BOOKING_PENDING], payments: [PAYMENT] });
  });

  test('200 returns payment status for booking owner', async () => {
    const res = await request(app)
      .get('/api/bookings/booking-1/payment-status')
      .set('Authorization', guestToken);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('pending');
  });

  test('403 when caller does not own the booking', async () => {
    const res = await request(app)
      .get('/api/bookings/booking-1/payment-status')
      .set('Authorization', guest2Token);
    expect(res.status).toBe(403);
  });

  test('404 when booking does not exist', async () => {
    const res = await request(app)
      .get('/api/bookings/nonexistent/payment-status')
      .set('Authorization', guestToken);
    expect(res.status).toBe(404);
  });
});

// ===========================================================================
// POST /api/bookings/:id/cancel
// ===========================================================================
describe('POST /api/bookings/:id/cancel', () => {
  test('200 cancels a pending_payment booking', async () => {
    db.__seed({ listings: [LISTING], bookings: [BOOKING_PENDING] });
    const res = await request(app)
      .post('/api/bookings/booking-1/cancel')
      .set('Authorization', guestToken);
    expect(res.status).toBe(200);
  });

  test('200 cancels a confirmed booking within 24h window', async () => {
    db.__seed({ listings: [LISTING], bookings: [BOOKING_CONFIRMED] });
    const res = await request(app)
      .post('/api/bookings/booking-confirmed/cancel')
      .set('Authorization', guestToken);
    expect(res.status).toBe(200);
  });

  test('400 when confirmed booking window is closed (> 24h)', async () => {
    db.__seed({ listings: [LISTING], bookings: [BOOKING_CONFIRMED_OLD] });
    const res = await request(app)
      .post('/api/bookings/booking-confirmed-old/cancel')
      .set('Authorization', guestToken);
    expect(res.status).toBe(400);
  });

  test('409 when confirmed booking payout has already been paid', async () => {
    const PAID_PAYOUT = {
      id: 'payout-1',
      booking_id: 'booking-confirmed',
      host_id: 'host-1',
      amount: '255.00',
      status: 'paid',
      payment_confirmed_at: BOOKING_CONFIRMED.payment_confirmed_at,
      created_at: new Date().toISOString(),
    };

    // We need to make the mock return the payout for this booking
    // Inject it via __seed and override the query dispatch for payouts
    db.__seed({ listings: [LISTING], bookings: [BOOKING_CONFIRMED] });

    // The payout query is not in the mock dispatch — patch connect() for this test
    const originalConnect = db.connect.bind(db);
    db.connect = async () => {
      const client = await originalConnect();
      const originalClientQuery = client.query.bind(client);
      client.query = async (sql, params) => {
        const norm = sql.trim().replace(/\s+/g, ' ').toLowerCase();
        if (norm.includes('select') && norm.includes('from payouts') && norm.includes('booking_id = $1')) {
          return { rows: [PAID_PAYOUT] };
        }
        return originalClientQuery(sql, params);
      };
      return client;
    };

    const res = await request(app)
      .post('/api/bookings/booking-confirmed/cancel')
      .set('Authorization', guestToken);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);

    // Restore
    db.connect = originalConnect;
  });

  test('403 when caller does not own the booking', async () => {
    db.__seed({ listings: [LISTING], bookings: [BOOKING_PENDING] });
    const res = await request(app)
      .post('/api/bookings/booking-1/cancel')
      .set('Authorization', guest2Token);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('403 when caller is a host, not a guest', async () => {
    db.__seed({ listings: [LISTING], bookings: [BOOKING_PENDING] });
    const res = await request(app)
      .post('/api/bookings/booking-1/cancel')
      .set('Authorization', hostToken);
    expect(res.status).toBe(403);
  });

  test('404 when booking does not exist', async () => {
    const res = await request(app)
      .post('/api/bookings/nonexistent/cancel')
      .set('Authorization', guestToken);
    expect(res.status).toBe(404);
  });
});

// ===========================================================================
// GET /api/bookings/my-bookings
// ===========================================================================
describe('GET /api/bookings/my-bookings', () => {
  test('403 when caller is a host', async () => {
    const res = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', hostToken);
    expect(res.status).toBe(403);
  });

  test('401 when no token', async () => {
    const res = await request(app).get('/api/bookings/my-bookings');
    expect(res.status).toBe(401);
  });

  test('200 returns bookings array for a guest', async () => {
    // The mock query for my-bookings hits complex JOIN queries — it will return
    // empty rows from the catch-all, which is fine for this structural check.
    const res = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', guestToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.bookings)).toBe(true);
  });
});

// ===========================================================================
// GET /api/bookings/host-bookings
// ===========================================================================
describe('GET /api/bookings/host-bookings', () => {
  test('403 when caller is a guest', async () => {
    const res = await request(app)
      .get('/api/bookings/host-bookings')
      .set('Authorization', guestToken);
    expect(res.status).toBe(403);
  });

  test('401 when no token', async () => {
    const res = await request(app).get('/api/bookings/host-bookings');
    expect(res.status).toBe(401);
  });

  test('200 returns bookings array for a host', async () => {
    const res = await request(app)
      .get('/api/bookings/host-bookings')
      .set('Authorization', hostToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.bookings)).toBe(true);
  });
});

// ===========================================================================
// expireIfPastDeadline — unit tests (tests that the DB UPDATE is called)
// ===========================================================================
describe('expireIfPastDeadline', () => {
  const expireIfPastDeadline = require('../utils/expireBooking');

  test('returns booking unchanged when status is not pending_payment', async () => {
    const booking = { ...BOOKING_CONFIRMED };
    const result = await expireIfPastDeadline(db, booking);
    expect(result.status).toBe('confirmed');
  });

  test('returns booking unchanged when deadline is in the future', async () => {
    const booking = { ...BOOKING_PENDING };
    const result = await expireIfPastDeadline(db, booking);
    expect(result.status).toBe('pending_payment');
  });

  test('flips status to cancelled and persists the UPDATE when deadline is past', async () => {
    db.__seed({ bookings: [BOOKING_EXPIRED] });

    const result = await expireIfPastDeadline(db, BOOKING_EXPIRED);

    // Return value must be cancelled
    expect(result.status).toBe('cancelled');

    // The in-memory booking must also be updated (persisted, not just returned)
    const stored = db.__bookings().find(b => b.id === 'booking-expired');
    expect(stored.status).toBe('cancelled');
  });

  test('marks most recent pending payment as expired', async () => {
    const PENDING_PAYMENT = {
      id: 'pay-1',
      booking_id: 'booking-expired',
      status: 'pending',
      created_at: new Date().toISOString(),
      receipt_image_url: 'https://x.com/r.jpg',
      confirmed_at: null,
      transaction_code: null,
      rejection_reason: null,
      submitted_at: new Date().toISOString(),
    };
    db.__seed({ bookings: [BOOKING_EXPIRED], payments: [PENDING_PAYMENT] });

    await expireIfPastDeadline(db, BOOKING_EXPIRED);

    const stored = db.__payments().find(p => p.id === 'pay-1');
    expect(stored.status).toBe('expired');
  });
});
