import ApiError from '../../utils/ApiError.js';
import { HOST_COMMISSION_RATE } from '../../config/constants.js';
import { findActiveUserById } from '../auth/auth.repository.js';
import {
  expireAllStalePendingBookings,
  expireSinglePendingBooking,
  findGuestBookingForUpdate,
  withTransaction,
} from '../bookings/booking.repository.js';
import {
  confirmPaymentAtomic,
  createPaymentReceipt,
  findLatestPaymentForBooking,
  findPaymentForAdminUpdate,
  findPendingPaymentsQueue,
  rejectPaymentAtomic,
} from './payment.repository.js';

// Commission rate is centralized in src/config/constants.js

function joinName(first, middle, last) {
  return [first, middle, last].filter(Boolean).join(' ');
}

export async function submitPaymentReceipt(guestId, bookingId, receiptImageUrl) {
  return withTransaction(async (client) => {
    await expireSinglePendingBooking(client, bookingId);

    const booking = await findGuestBookingForUpdate(client, bookingId, guestId);

    if (!booking) {
      throw new ApiError(404, 'Booking not found.');
    }

    if (booking.status !== 'pending_payment') {
      throw new ApiError(
        400,
        'This booking is no longer accepting a payment receipt.',
      );
    }

    return createPaymentReceipt(client, { bookingId, receiptImageUrl });
  });
}

export async function getPaymentStatus(guestId, bookingId) {
  return withTransaction(async (client) => {
    await expireSinglePendingBooking(client, bookingId);

    const booking = await findGuestBookingForUpdate(client, bookingId, guestId);

    if (!booking) {
      throw new ApiError(404, 'Booking not found.');
    }

    const payment = await findLatestPaymentForBooking(client, bookingId);

    if (payment) {
      return {
        status: payment.status,
        submittedAt: payment.submitted_at,
        confirmedAt: payment.confirmed_at,
      };
    }

    // No receipt has ever been uploaded for this booking.
    return {
      status: booking.status === 'cancelled' ? 'expired' : 'pending',
      submittedAt: null,
      confirmedAt: null,
    };
  });
}

export async function getPendingPaymentsQueue() {
  await expireAllStalePendingBookings();
  return findPendingPaymentsQueue();
}

export async function confirmPayment(adminId, paymentId, transactionCode) {
  return withTransaction(async (client) => {
    const payment = await findPaymentForAdminUpdate(client, paymentId);

    if (!payment) {
      throw new ApiError(404, 'Payment not found.');
    }

    if (payment.payment_status !== 'pending') {
      throw new ApiError(400, 'This payment has already been reviewed.');
    }

    if (payment.booking_status !== 'pending_payment') {
      throw new ApiError(400, 'This booking is no longer awaiting payment.');
    }

    if (new Date(payment.payment_deadline) < new Date()) {
      // Lazily expire right here rather than leaving a stale row behind —
      // same rule used by every other read of a pending_payment booking.
      await expireSinglePendingBooking(client, payment.booking_id);
      throw new ApiError(
        400,
        'This booking already passed its payment deadline.',
      );
    }

    const admin = await findActiveUserById(adminId);
    const adminFullName = joinName(
      admin.first_name,
      admin.middle_name,
      admin.last_name,
    );

    const totalPrice = Number(payment.total_price);
    const payoutAmount =
      Math.round(totalPrice * (1 - HOST_COMMISSION_RATE) * 100) / 100;

    await confirmPaymentAtomic(client, {
      paymentId: payment.payment_id,
      bookingId: payment.booking_id,
      transactionCode,
      adminId,
      adminFullName,
      hostId: payment.host_id,
      guestFullName: joinName(
        payment.guest_first_name,
        payment.guest_middle_name,
        payment.guest_last_name,
      ),
      totalPrice,
      payoutAmount,
    });

    return { bookingId: payment.booking_id, status: 'confirmed' };
  });
}

// NOTE: per api-contract.md's "resubmission is allowed after a
// rejection" rule, the booking is intentionally NOT cancelled here —
// only the payment attempt is marked rejected. The guest can submit a
// new receipt for the same booking before payment_deadline passes.
export async function rejectPayment(adminId, paymentId, reason) {
  return withTransaction(async (client) => {
    const payment = await findPaymentForAdminUpdate(client, paymentId);

    if (!payment) {
      throw new ApiError(404, 'Payment not found.');
    }

    if (payment.payment_status !== 'pending') {
      throw new ApiError(400, 'This payment has already been reviewed.');
    }

    await rejectPaymentAtomic(client, {
      paymentId: payment.payment_id,
      reason,
      adminId,
    });

    return { bookingId: payment.booking_id, paymentStatus: 'rejected' };
  });
}