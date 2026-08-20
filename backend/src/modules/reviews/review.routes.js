import { Router } from 'express';

import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './review.controller.js';
import { validateCreateReview } from './review.validators.js';

const publicReviewRouter = Router();
const bookingReviewRouter = Router();
const adminReviewRouter = Router();

// GET /api/reviews/listing/:listingId
publicReviewRouter.get(
  '/listing/:listingId',
  controller.getPublicListingReviews,
);

// POST /api/bookings/:bookingId/review
bookingReviewRouter.post(
  '/:bookingId/review',
  authenticate,
  requireRole('guest'),
  validate(validateCreateReview),
  controller.createBookingReview,
);

// GET /api/admin/reviews
adminReviewRouter.get(
  '/',
  authenticate,
  requireRole('admin'),
  controller.getAdminReviews,
);

// DELETE /api/admin/reviews/:id
adminReviewRouter.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  controller.deleteAdminReview,
);

export {
  publicReviewRouter,
  bookingReviewRouter,
  adminReviewRouter,
};