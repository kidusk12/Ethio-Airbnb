const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

/**
 * Register a new user.
 *
 * @param {{ name: string, email: string, password: string, role: "guest"|"host" }} payload
 * @returns {Promise<{ status: number, body: object }>}
 *   Resolves with the HTTP status and parsed JSON body so callers can branch on
 *   status codes (201 / 400 / 409 / 500) without try-catching HTTP errors.
 * @throws {Error} Only on network failures (fetch itself rejects).
 */
export async function registerUser({ firstName, middleName, lastName, phoneNumber, email, password, role }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, middleName, lastName, phoneNumber, email, password, role }),
  });

  const body = await res.json();
  return { status: res.status, body };
}

/**
 * Log a user in.
 *
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ status: number, body: object }>}
 * @throws {Error} Only on network failures (fetch itself rejects).
 */
export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = await res.json();
  return { status: res.status, body };
}

/**
 * Log the current user out server-side. JWTs are stateless, so this is a
 * courtesy call for the backend's audit/logging purposes — it does not
 * itself invalidate the token. Local cleanup (AuthContext.logout) is what
 * actually prevents further use of the session on this client.
 *
 * @param {string} token
 * @returns {Promise<{ status: number, body: object }>}
 * @throws {Error} Only on network failures (fetch itself rejects).
 */
export async function logoutUser(token) {
  const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await res.json();
  return { status: res.status, body };
}

export async function getListings(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_BASE_URL}/api/listings?${params}`);
  const body = await res.json();
  return { status: res.status, body };
}
export async function uploadFile(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const body = await res.json();
  return { status: res.status, body };
}

export async function createListing(listingData, token) {
  const res = await fetch(`${API_BASE_URL}/api/listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(listingData),
  });

  const body = await res.json();
  return { status: res.status, body };
}

export async function saveHostVerification(idDocumentUrl, token) {
  const res = await fetch(`${API_BASE_URL}/api/hosts/verification`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ idDocumentUrl }),
  });

  const body = await res.json();
  return { status: res.status, body };
}

export async function getPendingListings(token) {
  const res = await fetch(`${API_BASE_URL}/api/admin/listings/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json();
  return { status: res.status, body };
}

export async function approveListing(id, token) {
  const res = await fetch(`${API_BASE_URL}/api/admin/listings/${id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json();
  return { status: res.status, body };
}

export async function rejectListing(id, token, reason) {
  const res = await fetch(`${API_BASE_URL}/api/admin/listings/${id}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reason ? { reason } : {}),
  });

  const body = await res.json();
  return { status: res.status, body };
}

export function resolveFileUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
}

export async function getListingDetail(id) {
  const res = await fetch(`${API_BASE_URL}/api/listings/${id}`);
  const body = await res.json();
  return { status: res.status, body };
}

export async function getListingReviews(listingId) {
  const res = await fetch(`${API_BASE_URL}/api/reviews/listing/${listingId}`);
  const body = await res.json();
  return { status: res.status, body };
}
export async function createBooking(payload, token) {
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  return { status: res.status, body };
}

export async function submitPaymentReceipt(bookingId, receiptImageUrl, token) {
  const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/payment-receipt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ receiptImageUrl }),
  });
  const body = await res.json();
  return { status: res.status, body };
}
export async function getMyBookings(token) {
  const res = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  return { status: res.status, body };
}

export async function getPendingPayments(token) {
  const res = await fetch(`${API_BASE_URL}/api/admin/payments/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  return { status: res.status, body };
}

export async function confirmPayment(id, transactionCode, token) {
  const res = await fetch(`${API_BASE_URL}/api/admin/payments/${id}/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ transactionCode }),
  });
  const body = await res.json();
  return { status: res.status, body };
}

export async function rejectPayment(id, token, reason) {
  const res = await fetch(`${API_BASE_URL}/api/admin/payments/${id}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reason ? { reason } : {}),
  });
  const body = await res.json();
  return { status: res.status, body };
}

export async function getAllListingsAdmin(token) {
  const res = await fetch(`${API_BASE_URL}/api/admin/listings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  return { status: res.status, body };
}
export async function getDuePayouts(token) {
  const res = await fetch(`${API_BASE_URL}/api/admin/payouts/due`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  return { status: res.status, body };
}

export async function markPayoutPaid(id, transactionCode, token) {
  const res = await fetch(`${API_BASE_URL}/api/admin/payouts/${id}/mark-paid`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ transactionCode }),
  });
  const body = await res.json();
  return { status: res.status, body };
}

export async function getAllTransactions(token) {
  const res = await fetch(`${API_BASE_URL}/api/admin/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  return { status: res.status, body };
}
export async function getMyListings(token) {
  const res = await fetch(`${API_BASE_URL}/api/listings/my-listings`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const body = await res.json();
  return { status: res.status, body };
}
export async function getHostBookings(token) {
  const res = await fetch(`${API_BASE_URL}/api/bookings/host-bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  return { status: res.status, body };
}

export async function submitReview(bookingId, { rating, text }, token) {
  const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, text }),
  });
  const body = await res.json();
  return { status: res.status, body };
}