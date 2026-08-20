import { Router } from 'express';

import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './payment.controller.js';
import {
  validateConfirmPayment,
  validateRejectPayment,
  validateSubmitReceipt,
} from './payment.validators.js';

// Guest-facing — mounted onto the same '/api/bookings' base path as
// booking.routes.js's own router. Express allows two routers on the
// same prefix, so this stays a self-contained module without needing
// to edit booking.routes.js.
const bookingPaymentRouter = Router();

bookingPaymentRouter.post(
  '/:id/payment-receipt',
  authenticate,
  requireRole('guest'),
  validate(validateSubmitReceipt),
  controller.submitReceipt,
);

bookingPaymentRouter.get(
  '/:id/payment-status',
  authenticate,
  requireRole('guest'),
  controller.paymentStatus,
);

// Admin-facing — mounted at '/api/admin/payments'.
const adminPaymentRouter = Router();

adminPaymentRouter.use(authenticate, requireRole('admin'));

adminPaymentRouter.get('/pending', controller.pendingPayments);

adminPaymentRouter.post(
  '/:id/confirm',
  validate(validateConfirmPayment),
  controller.confirm,
);

adminPaymentRouter.post(
  '/:id/reject',
  validate(validateRejectPayment),
  controller.reject,
);

export { adminPaymentRouter, bookingPaymentRouter };