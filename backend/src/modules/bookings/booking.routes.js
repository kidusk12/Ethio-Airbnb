import { Router } from 'express';

import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './booking.controller.js';
import { validateCreateBooking } from './booking.validators.js';

const bookingRouter = Router();

// Public availability check
bookingRouter.get('/availability', controller.availability);

// Guest-only endpoints
bookingRouter.post(
  '/',
  authenticate,
  requireRole('guest'),
  validate(validateCreateBooking),
  controller.create,
);

bookingRouter.get(
  '/my-bookings',
  authenticate,
  requireRole('guest'),
  controller.getMyBookings,
);

bookingRouter.post(
  '/:id/cancel',
  authenticate,
  requireRole('guest'),
  controller.cancel,
);

// Host-only endpoint
bookingRouter.get(
  '/host-bookings',
  authenticate,
  requireRole('host'),
  controller.getHostBookings,
);

export default bookingRouter;