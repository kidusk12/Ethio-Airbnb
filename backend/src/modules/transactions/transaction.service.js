import { findAllTransactions } from './transaction.repository.js';

export async function getAllTransactions() {
  // No lazy-expiry, no business rules — this table is a pure append-only
  // audit log, already correct by the time payment/payout confirmation
  // wrote to it. Nothing to do here but read it back.
  return findAllTransactions();
}