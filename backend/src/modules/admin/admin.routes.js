import { Router } from 'express';

import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './admin.controller.js';
import { validateRejectListing } from './admin.validators.js';

const adminRouter = Router();

adminRouter.use(authenticate, requireRole('admin'));

adminRouter.get('/listings/pending', controller.getPendingListings);
adminRouter.get('/listings', controller.getAllListings);

adminRouter.post('/listings/:id/approve', controller.approveListing);

adminRouter.post(
  '/listings/:id/reject',
  validate(validateRejectListing),
  controller.rejectListing,
);

adminRouter.delete('/listings/:id', controller.deleteListing);
adminRouter.get('/stats', controller.getStats);

export default adminRouter;