import ApiError from '../../utils/ApiError.js';
import { findPayoutForBookingForUpdate, voidPayout } from '../payouts/payout.repository.js';
import {
  cancelConfirmedBooking,
  cancelPendingBooking,
  createBooking,
  expirePendingBookingsForGuest,
  expirePendingBookingsForHost,
  expirePendingBookingsForListing,
  expireSinglePendingBooking,
  findBookableListing,
  findBookableListingForUpdate,
  findGuestBookingForUpdate,
  findGuestBookings,
  findHostBookings,
  hasOverlappingBooking,
  refundConfirmedPayment,
  withTransaction,
} from './booking.repository.js';

function numberOfNights(checkIn, checkOut) {
  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);

  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

function validateDates(checkIn, checkOut) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);

  if (start < today) {
    throw new ApiError(400, 'Check-in date cannot be in the past.');
  }

  if (end <= start) {
    throw new ApiError(400, 'Check-out must be after check-in.');
  }
}

export async function checkAvailability({
  listingId,
  checkIn,
  checkOut,
}) {
  validateDates(checkIn, checkOut);

  return withTransaction(async (client) => {
    const listing = await findBookableListingForUpdate(client, listingId);

    if (!listing) {
      throw new ApiError(404, 'Listing not found.');
    }

    await expirePendingBookingsForListing(client, listingId);

    const hasOverlap = await hasOverlappingBooking(client, {
      listingId,
      checkIn,
      checkOut,
    });

    return !hasOverlap;
  });
}

export async function createGuestBooking(guestId, data) {
  validateDates(data.checkIn, data.checkOut);

  return withTransaction(async (client) => {
    // This row lock serializes booking attempts for a listing.
    const listing = await findBookableListingForUpdate(
      client,
      data.listingId,
    );

    if (!listing) {
      throw new ApiError(404, 'Listing not found.');
    }

    if (listing.host_id === guestId) {
      throw new ApiError(403, 'You cannot book your own listing.');
    }

    if (data.guestCount > listing.max_guests) {
      throw new ApiError(
        400,
        `This listing allows a maximum of ${listing.max_guests} guests.`,
      );
    }

    await expirePendingBookingsForListing(client, data.listingId);

    const hasOverlap = await hasOverlappingBooking(client, {
      listingId: data.listingId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
    });

    if (hasOverlap) {
      throw new ApiError(
        409,
        'These dates are no longer available for this property.',
      );
    }

    const nights = numberOfNights(data.checkIn, data.checkOut);
    const totalPrice = Number(listing.price_per_night) * nights;

    return createBooking(client, {
      listingId: data.listingId,
      guestId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guestCount: data.guestCount,
      totalPrice,
    });
  });
}

export async function getGuestBookings(guestId) {
  await expirePendingBookingsForGuest(guestId);
  return findGuestBookings(guestId);
}

export async function getHostBookings(hostId) {
  await expirePendingBookingsForHost(hostId);
  return findHostBookings(hostId);
}

export async function cancelGuestBooking(guestId, bookingId) {
  return withTransaction(async (client) => {
    await expireSinglePendingBooking(client, bookingId);

    const booking = await findGuestBookingForUpdate(
      client,
      bookingId,
      guestId,
    );

    if (!booking) {
      throw new ApiError(404, 'Booking not found.');
    }

    if (booking.status === 'pending_payment') {
      // No money involved yet — nothing to void or refund.
      return cancelPendingBooking(client, bookingId);
    }

    if (booking.status === 'confirmed') {
      const windowCloses = new Date(booking.payment_confirmed_at);
      windowCloses.setUTCHours(windowCloses.getUTCHours() + 24);

      if (new Date() >= windowCloses) {
        throw new ApiError(
          400,
          'This booking can no longer be cancelled — the 24-hour window after payment confirmation has closed.',
        );
      }

      const payout = await findPayoutForBookingForUpdate(client, bookingId);

      // Real money already moved to the host — outside this endpoint's
      // scope, needs manual admin follow-up rather than a silent no-op.
      if (payout && payout.status === 'paid') {
        throw new ApiError(
          409,
          'This booking has already been paid out to the host and cannot be cancelled automatically. Contact support.',
        );
      }

      if (payout && payout.status === 'due') {
        await voidPayout(client, payout.id);
      }

      // Known simplification (per api-contract.md): this records that a
      // refund is owed, it does not itself move real money. That happens
      // outside the system, admin-coordinated.
      await refundConfirmedPayment(client, bookingId);

      return cancelConfirmedBooking(client, bookingId);
    }

    throw new ApiError(400, 'This booking is not eligible for cancellation.');
  });
}