import { success } from '../../utils/apiResponse.js';
import {
  toAdminReviewDto,
  toPublicReviewDto,
} from './review.dto.js';
import * as reviewService from './review.service.js';

export async function getPublicListingReviews(req, res, next) {
  try {
    const result = await reviewService.getListingReviews(
      req.params.listingId,
    );

    return success(res, {
      data: {
        reviews: result.reviews.map(toPublicReviewDto),
        averageRating: result.averageRating,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createBookingReview(req, res, next) {
  try {
    const review = await reviewService.submitReview(
      req.user.id,
      req.params.bookingId,
      req.body,
    );

    return success(res, {
      status: 201,
      message: 'Review submitted successfully.',
      data: {
        id: review.id,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminReviews(req, res, next) {
  try {
    const reviews = await reviewService.getAllReviewsForAdmin();

    return success(res, {
      data: {
        reviews: reviews.map(toAdminReviewDto),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAdminReview(req, res, next) {
  try {
    await reviewService.removeReview(req.params.id);

    return success(res, {
      message: 'Review removed successfully.',
    });
  } catch (error) {
    return next(error);
  }
}