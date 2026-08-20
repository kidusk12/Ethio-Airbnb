import { Router } from 'express';

import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './payout.controller.js';
import { validateMarkPaid } from './payout.validators.js';

const payoutRouter = Router();

payoutRouter.use(authenticate, requireRole('admin'));

payoutRouter.get('/due', controller.duePayouts);

payoutRouter.post(
  '/:id/mark-paid',
  validate(validateMarkPaid),
  controller.markPaid,
);

export default payoutRouter;