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
export async function registerUser({ name, email, password, role }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
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