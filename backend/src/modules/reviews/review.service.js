import ApiError from '../../utils/ApiError.js';
import {
  createReview,
  deleteReviewById,
  findAllReviewsForAdmin,
  findBookingById,
  findPublicReviewsByListingId,
  getAverageRatingForListing,
} from './review.repository.js';

export async function getListingReviews(listingId) {
  const [reviews, averageRating] = await Promise.all([
    findPublicReviewsByListingId(listingId),
    getAverageRatingForListing(listingId),
  ]);

  return {
    reviews,
    averageRating,
  };
}

export async function submitReview(guestId, bookingId, data) {
  const booking = await findBookingById(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Booking not found.');
  }

  if (booking.guest_id !== guestId) {
    throw new ApiError(
      403,
      'You do not have permission to review this booking.',
    );
  }

  // check_out is stored as DATE. A review becomes eligible the day
  // after checkout, matching `checkOut < now()` from the contract.
  const today = new Date().toISOString().slice(0, 10);

  if (
    booking.status !== 'confirmed' ||
    booking.check_out >= today
  ) {
    throw new ApiError(
      403,
      'You can only review a confirmed stay after checkout.',
    );
  }

  try {
    return await createReview({
      bookingId,
      listingId: booking.listing_id,
      guestId,
      rating: data.rating,
      text: data.text,
    });
  } catch (error) {
    // `reviews.booking_id` has a UNIQUE constraint. Let PostgreSQL be
    // the race-safe source of truth for duplicate-review prevention.
    if (error.code === '23505') {
      throw new ApiError(
        403,
        'You have already reviewed this booking.',
      );
    }

    throw error;
  }
}

export async function getAllReviewsForAdmin() {
  return findAllReviewsForAdmin();
}

export async function removeReview(reviewId) {
  const deletedReview = await deleteReviewById(reviewId);

  if (!deletedReview) {
    throw new ApiError(404, 'Review not found.');
  }

  return deletedReview;
}