import { success } from '../../utils/apiResponse.js';
import {
  toGuestBookingDto,
  toHostBookingDto,
} from './booking.dto.js';
import * as bookingService from './booking.service.js';

export async function availability(req, res, next) {
  try {
    const { listingId, checkIn, checkOut } = req.query;

    if (!listingId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'listingId, checkIn, and checkOut are required.',
      });
    }

    const available = await bookingService.checkAvailability({
      listingId,
      checkIn,
      checkOut,
    });

    return success(res, {
      data: { available },
    });
  } catch (error) {
    return next(error);
  }
}

export async function create(req, res, next) {
  try {
    const booking = await bookingService.createGuestBooking(
      req.user.id,
      req.body,
    );

    return success(res, {
      status: 201,
      message: 'Booking created. Upload payment proof within one hour.',
      data: {
        bookingId: booking.id,
        totalPrice: Number(booking.total_price),
        status: booking.status,
        paymentDeadline: booking.payment_deadline,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMyBookings(req, res, next) {
  try {
    const bookings = await bookingService.getGuestBookings(req.user.id);

    return success(res, {
      data: {
        bookings: bookings.map(toGuestBookingDto),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getHostBookings(req, res, next) {
  try {
    const bookings = await bookingService.getHostBookings(req.user.id);

    return success(res, {
      data: {
        bookings: bookings.map(toHostBookingDto),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function cancel(req, res, next) {
  try {
    const booking = await bookingService.cancelGuestBooking(
      req.user.id,
      req.params.id,
    );

    return success(res, {
      message: 'Booking cancelled successfully.',
      data: {
        bookingId: booking.id,
        status: booking.status,
      },
    });
  } catch (error) {
    return next(error);
  }
}