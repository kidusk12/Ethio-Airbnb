import pool from '../../config/db.js';

const userColumns = `
  id,
  first_name,
  middle_name,
  last_name,
  phone_number,
  email,
  password_hash,
  role,
  id_document_url,
  deleted_at,
  created_at
`;

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT ${userColumns} FROM users WHERE LOWER(email) = LOWER($1)`,
    [email],
  );

  return rows[0] ?? null;
}

export async function findActiveUserByEmail(email) {
  const { rows } = await pool.query(
    `
      SELECT ${userColumns}
      FROM users
      WHERE LOWER(email) = LOWER($1)
        AND deleted_at IS NULL
    `,
    [email],
  );

  return rows[0] ?? null;
}

export async function findActiveUserById(id) {
  const { rows } = await pool.query(
    `SELECT ${userColumns} FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );

  return rows[0] ?? null;
}

export async function createUser({
  firstName,
  middleName,
  lastName,
  phoneNumber,
  email,
  passwordHash,
  role,
}) {
  const { rows } = await pool.query(
    `
      INSERT INTO users (
        first_name,
        middle_name,
        last_name,
        phone_number,
        email,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, $4, LOWER($5), $6, $7)
      RETURNING ${userColumns}
    `,
    [
      firstName,
      middleName || null,
      lastName,
      phoneNumber,
      email,
      passwordHash,
      role,
    ],
  );

  return rows[0];
}

export async function updateUser(id, fields) {
  const entries = Object.entries(fields);

  if (entries.length === 0) {
    return findActiveUserById(id);
  }

  const setClause = entries
    .map(([field], index) => `${field} = $${index + 1}`)
    .join(', ');

  const values = entries.map(([, value]) => value);

  const { rows } = await pool.query(
    `
      UPDATE users
      SET ${setClause}
      WHERE id = $${values.length + 1}
        AND deleted_at IS NULL
      RETURNING ${userColumns}
    `,
    [...values, id],
  );

  return rows[0] ?? null;
}

export async function saveHostVerification(id, idDocumentUrl) {
  return updateUser(id, {
    id_document_url: idDocumentUrl,
  });
}

export async function softDeleteUser(id) {
  const { rows } = await pool.query(
    `
      UPDATE users
      SET deleted_at = now()
      WHERE id = $1
        AND deleted_at IS NULL
      RETURNING id
    `,
    [id],
  );

  return rows[0] ?? null;
}

export async function hasGuestDeletionBlock(userId) {
  const { rows } = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM bookings
        WHERE guest_id = $1
          AND status IN ('pending_payment', 'confirmed')
      ) AS blocked
    `,
    [userId],
  );

  return rows[0].blocked;
}

export async function hasHostDeletionBlock(userId) {
  const { rows } = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM listings
        WHERE host_id = $1
          AND active = true
          AND status IN ('pending', 'approved')
      )
      OR EXISTS (
        SELECT 1
        FROM bookings b
        INNER JOIN listings l ON l.id = b.listing_id
        WHERE l.host_id = $1
          AND b.status IN ('pending_payment', 'confirmed')
      ) AS blocked
    `,
    [userId],
  );

  return rows[0].blocked;
}