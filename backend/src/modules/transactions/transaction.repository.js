import pool from '../../config/db.js';

export async function findAllTransactions() {
  const { rows } = await pool.query(`
    SELECT
      id,
      transaction_code,
      type,
      counterparty_name,
      amount,
      booking_id,
      performed_by_admin_id,
      performed_by_admin_name,
      created_at
    FROM transactions
    ORDER BY created_at DESC
  `);

  return rows;
}