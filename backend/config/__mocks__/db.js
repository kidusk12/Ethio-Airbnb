/**
 * Mock pg-style pool for testing routes in isolation.
 *
 * Implements pool.query(sql, params) AND pool.connect() → client
 * (client has .query / .release — needed for transaction tests).
 *
 * In-memory tables: users, listings, bookings, payments.
 * Call db.__reset() in beforeEach to start fresh.
 * db.__seed({ users, listings, bookings, payments }) to pre-populate state.
 */

let users    = [];
let listings = [];
let bookings = [];
let payments = [];
let nextId   = 1;

function genId() { return String(nextId++); }

function reset() {
  users    = [];
  listings = [];
  bookings = [];
  payments = [];
  nextId   = 1;
}

// ---------------------------------------------------------------------------
// Normalise SQL for pattern matching
// ---------------------------------------------------------------------------
function norm(sql) {
  return sql.trim().replace(/\s+/g, ' ').toLowerCase();
}

// ---------------------------------------------------------------------------
// Core query dispatcher — handles all SQL patterns issued by routes
// ---------------------------------------------------------------------------
async function query(sql, params = []) {
  const n = norm(sql);

  // ── users ──────────────────────────────────────────────────────────────────
  if (n.startsWith('select id from users where email')) {
    const [email] = params;
    return { rows: users.filter(u => u.email === email).map(u => ({ id: u.id })) };
  }
  if (n.startsWith('select id, name, email, password_hash, role from users where email')) {
    const [email] = params;
    const user = users.find(u => u.email === email);
    return { rows: user ? [user] : [] };
  }
  if (n.startsWith('select id, name, email, role from users where id')) {
    const [id] = params;
    const user = users.find(u => u.id === id);
    return { rows: user ? [{ id: user.id, name: user.name, email: user.email, role: user.role }] : [] };
  }
  if (n.startsWith('select name from users where id')) {
    const [id] = params;
    const user = users.find(u => u.id === id);
    return { rows: user ? [{ name: user.name }] : [] };
  }
  if (n.startsWith('insert into users')) {
    const [name, email, password_hash, role] = params;
    const user = { id: genId(), name, email, password_hash, role };
    users.push(user);
    return { rows: [{ id: user.id, name: user.name, email: user.email, role: user.role }] };
  }

  // ── listings ───────────────────────────────────────────────────────────────
  if (n.includes('from listings') && n.includes('where') && n.includes('id = $1') && !n.includes('join')) {
    const id = params[0];
    const l = listings.find(x => x.id === id);
    if (!l) return { rows: [] };
    if (n.startsWith('select id, price_per_night')) {
      return { rows: [{ id: l.id, price_per_night: l.price_per_night, max_guests: l.max_guests, status: l.status, active: l.active }] };
    }
    if (n.startsWith('select host_id from listings')) {
      return { rows: [{ host_id: l.host_id }] };
    }
    return { rows: [l] };
  }

  if (n.startsWith('update listings')) {
    const id = params[params.length - 1];
    const l = listings.find(x => x.id === id);
    if (!l) return { rows: [] };
    if (n.includes("status = 'approved'")) { l.status = 'approved'; l.approved_by_admin_id = params[0]; }
    if (n.includes("status = 'rejected'")) { l.status = 'rejected'; l.rejected_by_admin_id = params[0]; l.rejection_reason = params[1]; }
    if (n.includes('active = false'))       { l.active = false; }
    return { rows: [{ id: l.id, status: l.status }] };
  }

  // ── bookings ───────────────────────────────────────────────────────────────
  if (n.includes('select *') && n.includes('from bookings') && n.includes('where') && params.length >= 1) {
    const id = params[0];
    const b = bookings.find(x => x.id === id);
    return { rows: b ? [b] : [] };
  }

  if (n.includes('from bookings') && n.includes('status in') && !n.includes('join')) {
    const [listingId, checkIn, checkOut] = params;
    const overlap = bookings.filter(b =>
      b.listing_id === listingId &&
      ['pending_payment', 'confirmed'].includes(b.status) &&
      new Date(b.check_in)  < new Date(checkOut) &&
      new Date(b.check_out) > new Date(checkIn)
    );
    return { rows: overlap.map(b => ({ id: b.id, status: b.status, payment_deadline: b.payment_deadline })) };
  }

  if (n.includes('from bookings') && n.includes("status = 'pending_payment'") && !n.includes('join')) {
    const [guestOrHostId] = params;
    const rows = bookings.filter(b =>
      b.status === 'pending_payment' &&
      (b.guest_id === guestOrHostId)
    );
    return { rows: rows.map(b => ({ id: b.id, status: b.status, payment_deadline: b.payment_deadline })) };
  }

  if (n.startsWith('insert into bookings')) {
    const [listing_id, guest_id, check_in, check_out, guest_count, total_price] = params;
    const booking = {
      id: genId(),
      listing_id, guest_id, check_in, check_out,
      guest_count, total_price,
      status: 'pending_payment',
      payment_deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      payment_confirmed_at: null,
      created_at: new Date().toISOString(),
    };
    bookings.push(booking);
    return {
      rows: [{
        id: booking.id,
        total_price: booking.total_price,
        status: booking.status,
        payment_deadline: booking.payment_deadline,
      }],
    };
  }

  if (n.startsWith('update bookings set status')) {
    const id = params[params.length - 1];
    const b = bookings.find(x => x.id === id);
    if (!b) return { rows: [] };
    if (n.includes("'cancelled'"))  b.status = 'cancelled';
    if (n.includes("'confirmed'"))  { b.status = 'confirmed'; b.payment_confirmed_at = new Date().toISOString(); }
    return { rows: [{ id: b.id }] };
  }

  if (n.startsWith('update bookings') && n.includes('payment_confirmed_at')) {
    const id = params[params.length - 1];
    const b = bookings.find(x => x.id === id);
    if (b) { b.status = 'confirmed'; b.payment_confirmed_at = new Date().toISOString(); }
    return { rows: b ? [{ id: b.id }] : [] };
  }

  // ── payments ───────────────────────────────────────────────────────────────
  if (n.startsWith('insert into payments')) {
    const [booking_id, receipt_image_url] = params;
    const payment = {
      id: genId(),
      booking_id,
      receipt_image_url,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      created_at:   new Date().toISOString(),
      confirmed_at: null,
      transaction_code: null,
      rejection_reason: null,
    };
    payments.push(payment);
    return { rows: [{ id: payment.id, booking_id: payment.booking_id, status: payment.status, submitted_at: payment.submitted_at }] };
  }

  if (n.startsWith('select') && n.includes('from payments') && n.includes('booking_id = $1') && n.includes('order by') && n.includes('limit 1')) {
    const [booking_id] = params;
    const sorted = payments.filter(p => p.booking_id === booking_id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: sorted.length > 0 ? [sorted[0]] : [] };
  }

  if (n.startsWith('select') && n.includes('from payments') && n.includes('where p.id = $1')) {
    const [id] = params;
    const p = payments.find(x => x.id === id);
    if (!p) return { rows: [] };
    const b = bookings.find(bk => bk.id === p.booking_id);
    return { rows: p ? [{ ...p, booking_status: b?.status, payment_deadline: b?.payment_deadline,
                          total_price: b?.total_price, listing_id: b?.listing_id, guest_id: b?.guest_id,
                          booking_id: p.booking_id }] : [] };
  }

  // UPDATE payments via subquery (expireBooking / cancel use WHERE id = (SELECT ...))
  if (n.startsWith('update payments') && n.includes('where id = (')) {
    const [booking_id] = params;
    const sorted = payments.filter(p => p.booking_id === booking_id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const p = sorted[0];
    if (p) {
      if (n.includes("'expired'"))  p.status = 'expired';
      if (n.includes("'refunded'")) p.status = 'refunded';
    }
    return { rows: p ? [p] : [] };
  }

  // UPDATE payments status by direct id
  if (n.startsWith('update payments set status')) {
    const id = params[0];
    const p = payments.find(x => x.id === id);
    if (p) {
      if (n.includes("'expired'"))   p.status = 'expired';
      if (n.includes("'refunded'"))  p.status = 'refunded';
      if (n.includes("'rejected'"))  { p.status = 'rejected'; p.rejection_reason = params[1] || null; }
      if (n.includes("'confirmed'")) { p.status = 'confirmed'; p.confirmed_at = new Date().toISOString(); p.transaction_code = params[1] || null; }
    }
    return { rows: p ? [p] : [] };
  }

  // ── payouts ────────────────────────────────────────────────────────────────
  if (n.includes('from payouts') && n.includes('booking_id = $1') && !n.includes('join')) {
    return { rows: [] };
  }

  if (n.includes('from payouts') && n.includes('where po.id = $1')) {
    return { rows: [] };
  }

  if (n.startsWith('insert into payouts') || n.startsWith('insert into transactions')) {
    return { rows: [] };
  }

  if (n.startsWith('update payouts')) {
    return { rows: [] };
  }

  // ── transactions & reviews ─────────────────────────────────────────────────
  if (n.includes('from transactions')) {
    return { rows: [] };
  }

  if (n.startsWith('delete from reviews')) {
    const id = params[0];
    if (id === 'nonexistent') return { rows: [] };
    return { rows: [{ id }] };
  }

  if (n.includes('from reviews')) {
    return { rows: [] };
  }

  // ── catch-all for complex JOINs ───────────────────────────────────────────
  if (n.includes('join')) {
    return { rows: [] };
  }

  throw new Error(`Mock db received unexpected query:\n${sql}\nparams: ${JSON.stringify(params)}`);
}

// ---------------------------------------------------------------------------
// pool.connect() → returns a fake client that proxies to query()
// and tracks BEGIN/COMMIT/ROLLBACK calls.
// ---------------------------------------------------------------------------
function connect() {
  const txCalls = [];
  const client = {
    query: async (sql, params = []) => {
      const upper = sql.trim().toUpperCase().replace(/\s+/g, ' ');
      if (upper === 'BEGIN' || upper === 'COMMIT' || upper === 'ROLLBACK') {
        txCalls.push(upper);
        return { rows: [] };
      }
      return query(sql, params);
    },
    release: () => {},
    __txCalls: txCalls,
  };
  return Promise.resolve(client);
}

module.exports = {
  query,
  connect,
  __reset:    reset,
  __users:    () => users,
  __listings: () => listings,
  __bookings: () => bookings,
  __payments: () => payments,
  __seed: ({ users: u = [], listings: l = [], bookings: bk = [], payments: p = [] } = {}) => {
    users    = u.map(x => ({ ...x }));
    listings = l.map(x => ({ ...x }));
    bookings = bk.map(x => ({ ...x }));
    payments = p.map(x => ({ ...x }));
  },
};