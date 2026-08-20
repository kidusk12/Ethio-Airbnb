import ApiError from '../../utils/ApiError.js';
import { findActiveUserById } from '../auth/auth.repository.js';
import { withTransaction } from '../bookings/booking.repository.js';
import {
  findDuePayouts,
  findPayoutForAdminUpdate,
  markPayoutPaidAtomic,
} from './payout.repository.js';

function joinName(first, middle, last) {
  return [first, middle, last].filter(Boolean).join(' ');
}

export async function getDuePayouts() {
  // No lazy-expiry step here — unlike pending_payment bookings, payouts
  // don't auto-expire on a deadline. They sit as 'due' until an admin
  // acts; the 24h countdown shown to admins is computed client-side from
  // paymentConfirmedAt, not enforced server-side.
  return findDuePayouts();
}

export async function markPayoutPaid(adminId, payoutId, transactionCode) {
  return withTransaction(async (client) => {
    const payout = await findPayoutForAdminUpdate(client, payoutId);

    if (!payout) {
      throw new ApiError(404, 'Payout not found.');
    }

    if (payout.status !== 'due') {
      throw new ApiError(400, 'This payout has already been resolved.');
    }

    const admin = await findActiveUserById(adminId);
    const adminFullName = joinName(
      admin.first_name,
      admin.middle_name,
      admin.last_name,
    );
    const hostFullName = joinName(
      payout.host_first_name,
      payout.host_middle_name,
      payout.host_last_name,
    );

    await markPayoutPaidAtomic(client, {
      payoutId: payout.payout_id,
      transactionCode,
      adminId,
      adminFullName,
      hostFullName,
      bookingId: payout.booking_id,
      amount: Number(payout.amount),
    });

    return { payoutId: payout.payout_id, status: 'paid' };
  });
}