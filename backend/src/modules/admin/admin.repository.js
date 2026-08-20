import pool from '../../config/db.js';

const adminListingSelect = `
  SELECT
    l.id,
    l.host_id,
    l.category,
    l.title,
    l.description,
    l.city,
    l.sub_city,
    l.street_address,
    l.house_deed_photo_url,
    l.photos,
    l.amenities,
    l.bedrooms,
    l.bathrooms,
    l.max_guests,
    l.price_per_night,
    l.house_rules,
    l.status,
    l.active,
    l.rejection_reason,
    l.created_at,
    l.updated_at,

    u.first_name,
    u.middle_name,
    u.last_name,
    u.email AS host_email,
    u.phone_number AS host_phone_number,
    u.id_document_url AS host_id_document_url

  FROM listings l
  INNER JOIN users u ON u.id = l.host_id
`;

export async function findPendingListings() {
  const { rows } = await pool.query(`
    ${adminListingSelect}
    WHERE l.status = 'pending'
      AND l.active = true
    ORDER BY l.created_at ASC
  `);

  return rows;
}

export async function findAllListings() {
  const { rows } = await pool.query(`
    ${adminListingSelect}
    ORDER BY l.created_at DESC
  `);

  return rows;
}

export async function findListingForAdmin(listingId) {
  const { rows } = await pool.query(
    `
      ${adminListingSelect}
      WHERE l.id = $1
    `,
    [listingId],
  );

  return rows[0] ?? null;
}

export async function approveListing(listingId, adminId) {
  const { rows } = await pool.query(
    `
      UPDATE listings
      SET
        status = 'approved',
        approved_by_admin_id = $2,
        rejected_by_admin_id = NULL,
        rejection_reason = NULL,
        updated_at = now()
      WHERE id = $1
      RETURNING id, status, active
    `,
    [listingId, adminId],
  );

  return rows[0] ?? null;
}

export async function rejectListing(listingId, adminId, reason) {
  const { rows } = await pool.query(
    `
      UPDATE listings
      SET
        status = 'rejected',
        rejected_by_admin_id = $2,
        approved_by_admin_id = NULL,
        rejection_reason = $3,
        updated_at = now()
      WHERE id = $1
      RETURNING id, status, active, rejection_reason
    `,
    [listingId, adminId, reason || null],
  );

  return rows[0] ?? null;
}

export async function softDeleteListingAsAdmin(listingId) {
  const { rows } = await pool.query(
    `
      UPDATE listings
      SET
        active = false,
        updated_at = now()
      WHERE id = $1
      RETURNING id, status, active
    `,
    [listingId],
  );

  return rows[0] ?? null;
}

export async function getDashboardStats() {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM users WHERE deleted_at IS NULL) AS total_users,
      (SELECT COUNT(*)::int FROM listings WHERE active = true) AS total_listings,
      (SELECT COUNT(*)::int FROM listings WHERE active = true AND status = 'approved') AS approved_listings,
      (SELECT COUNT(*)::int FROM listings WHERE active = true AND status = 'rejected') AS rejected_listings,
      (SELECT COUNT(*)::int FROM listings WHERE active = true AND status = 'pending') AS pending_listings,
      (SELECT COUNT(*)::int FROM bookings) AS total_bookings,
      (SELECT COUNT(*)::int FROM bookings WHERE status = 'confirmed') AS confirmed_bookings,
      (SELECT COALESCE(SUM(amount), 0)::numeric FROM transactions WHERE type = 'userPayment') AS total_revenue
  `);

  return rows[0] ?? null;
}