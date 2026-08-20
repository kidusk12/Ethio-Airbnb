const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Make an authenticated fetch. Throws on network failure; returns
 * { status, body } for all HTTP responses so callers can branch on codes.
 */
async function apiFetch(path, { method = 'GET', token, body, isFormData } = {}) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const responseBody = await res.json().catch(() => ({}));
  return { status: res.status, body: responseBody };
}

// ─── Auth ────────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {{ firstName, middleName, lastName, phoneNumber, email, password, role }} payload
 */
export async function registerUser({ firstName, middleName, lastName, phoneNumber, email, password, role }) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: { firstName, middleName, lastName, phoneNumber, email, password, role },
  });
}

/**
 * Log a user in.
 * @param {{ email, password }} payload
 */
export async function loginUser({ email, password }) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

/**
 * Courtesy logout call to the server (JWT is stateless; local cleanup is
 * what actually secures the client).
 * @param {string} token
 */
export async function logoutUser(token) {
  return apiFetch('/api/auth/logout', { method: 'POST', token });
}

/**
 * Get the current authenticated user's profile.
 * @param {string} token
 */
export async function getMe(token) {
  return apiFetch('/api/auth/me', { token });
}

/**
 * Update the current user's profile / password.
 * @param {string} token
 * @param {object} payload
 */
export async function updateMe(token, payload) {
  return apiFetch('/api/auth/me', { method: 'PUT', token, body: payload });
}

// ─── Listings ────────────────────────────────────────────────────────────────

/**
 * Browse public listings with optional filters.
 * @param {{ location?, category?, minPrice?, maxPrice?, checkIn?, checkOut?, page?, limit? }} query
 */
export async function getPublicListings(query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) params.set(k, v);
  });
  const qs = params.toString();
  return apiFetch(`/api/listings${qs ? `?${qs}` : ''}`);
}

/**
 * Get a single public listing by ID.
 * @param {string} id  Listing UUID
 */
export async function getPublicListing(id) {
  return apiFetch(`/api/listings/${id}`);
}

/**
 * Get listings owned by the authenticated host.
 * @param {string} token
 */
export async function getMyListings(token) {
  return apiFetch('/api/listings/my-listings', { token });
}

/**
 * Submit a new listing (host only).
 * @param {string} token
 * @param {object} payload
 */
export async function createListing(token, payload) {
  return apiFetch('/api/listings', { method: 'POST', token, body: payload });
}

/**
 * Edit an existing listing (host only).
 * @param {string} token
 * @param {string} id
 * @param {object} payload
 */
export async function updateListing(token, id, payload) {
  return apiFetch(`/api/listings/${id}`, { method: 'PUT', token, body: payload });
}

/**
 * Soft-delete a listing (host only).
 * @param {string} token
 * @param {string} id
 */
export async function deleteListing(token, id) {
  return apiFetch(`/api/listings/${id}`, { method: 'DELETE', token });
}

// ─── Uploads ─────────────────────────────────────────────────────────────────

/**
 * Upload a single file. Returns { url } in body.data on success.
 * @param {string} token
 * @param {File} file
 */
export async function uploadFile(token, file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch('/api/uploads', {
    method: 'POST',
    token,
    body: formData,
    isFormData: true,
  });
}

// ─── Bookings ────────────────────────────────────────────────────────────────

/**
 * Check date availability for a listing.
 * @param {{ listingId, checkIn, checkOut }} params
 */
export async function checkAvailability({ listingId, checkIn, checkOut }) {
  return apiFetch(
    `/api/bookings/availability?listingId=${listingId}&checkIn=${checkIn}&checkOut=${checkOut}`,
  );
}

/**
 * Create a booking (guest only).
 * @param {string} token
 * @param {{ listingId, checkIn, checkOut, guestCount }} payload
 */
export async function createBooking(token, payload) {
  return apiFetch('/api/bookings', { method: 'POST', token, body: payload });
}

/**
 * Get the current guest's bookings.
 * @param {string} token
 */
export async function getMyBookings(token) {
  return apiFetch('/api/bookings/my-bookings', { token });
}

/**
 * Get bookings for the host's listings.
 * @param {string} token
 */
export async function getHostBookings(token) {
  return apiFetch('/api/bookings/host-bookings', { token });
}

/**
 * Cancel a booking (guest only).
 * @param {string} token
 * @param {string} bookingId
 */
export async function cancelBooking(token, bookingId) {
  return apiFetch(`/api/bookings/${bookingId}/cancel`, { method: 'POST', token });
}

/**
 * Submit a payment receipt for a booking (guest only).
 * @param {string} token
 * @param {string} bookingId
 * @param {string} receiptImageUrl  URL returned by uploadFile
 */
export async function submitPaymentReceipt(token, bookingId, receiptImageUrl) {
  return apiFetch(`/api/bookings/${bookingId}/payment-receipt`, {
    method: 'POST',
    token,
    body: { receiptImageUrl },
  });
}

/**
 * Get payment status for a booking (guest only).
 * @param {string} token
 * @param {string} bookingId
 */
export async function getPaymentStatus(token, bookingId) {
  return apiFetch(`/api/bookings/${bookingId}/payment-status`, { token });
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

/**
 * Get public reviews for a listing.
 * @param {string} listingId
 */
export async function getListingReviews(listingId) {
  return apiFetch(`/api/reviews/listing/${listingId}`);
}

/**
 * Submit a review for a completed booking (guest only).
 * @param {string} token
 * @param {string} bookingId
 * @param {{ rating: number, text?: string }} payload
 */
export async function submitReview(token, bookingId, payload) {
  return apiFetch(`/api/bookings/${bookingId}/review`, {
    method: 'POST',
    token,
    body: payload,
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

/** GET /api/admin/stats */
export async function adminGetStats(token) {
  return apiFetch('/api/admin/stats', { token });
}

/** GET /api/admin/listings/pending */
export async function adminGetPendingListings(token) {
  return apiFetch('/api/admin/listings/pending', { token });
}

/** GET /api/admin/listings */
export async function adminGetAllListings(token) {
  return apiFetch('/api/admin/listings', { token });
}

/** POST /api/admin/listings/:id/approve */
export async function adminApproveListing(token, id) {
  return apiFetch(`/api/admin/listings/${id}/approve`, { method: 'POST', token });
}

/** POST /api/admin/listings/:id/reject */
export async function adminRejectListing(token, id, reason) {
  return apiFetch(`/api/admin/listings/${id}/reject`, {
    method: 'POST',
    token,
    body: { reason },
  });
}

/** DELETE /api/admin/listings/:id */
export async function adminDeleteListing(token, id) {
  return apiFetch(`/api/admin/listings/${id}`, { method: 'DELETE', token });
}

/** GET /api/admin/payments/pending */
export async function adminGetPendingPayments(token) {
  return apiFetch('/api/admin/payments/pending', { token });
}

/** POST /api/admin/payments/:id/confirm */
export async function adminConfirmPayment(token, id, transactionCode) {
  return apiFetch(`/api/admin/payments/${id}/confirm`, {
    method: 'POST',
    token,
    body: { transactionCode },
  });
}

/** POST /api/admin/payments/:id/reject */
export async function adminRejectPayment(token, id, reason) {
  return apiFetch(`/api/admin/payments/${id}/reject`, {
    method: 'POST',
    token,
    body: { reason },
  });
}

/** GET /api/admin/payouts/due */
export async function adminGetDuePayouts(token) {
  return apiFetch('/api/admin/payouts/due', { token });
}

/** POST /api/admin/payouts/:id/mark-paid */
export async function adminMarkPayoutPaid(token, id, transactionCode) {
  return apiFetch(`/api/admin/payouts/${id}/mark-paid`, {
    method: 'POST',
    token,
    body: { transactionCode },
  });
}

/** GET /api/admin/transactions */
export async function adminGetTransactions(token) {
  return apiFetch('/api/admin/transactions', { token });
}

/** GET /api/admin/reviews */
export async function adminGetReviews(token) {
  return apiFetch('/api/admin/reviews', { token });
}

/** DELETE /api/admin/reviews/:id */
export async function adminDeleteReview(token, id) {
  return apiFetch(`/api/admin/reviews/${id}`, { method: 'DELETE', token });
}
