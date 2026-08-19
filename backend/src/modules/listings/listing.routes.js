import { Router } from 'express';

import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './listing.controller.js';
import {
  validateCreateListing,
  validateUpdateListing,
} from './listing.validators.js';

const listingRouter = Router();

// Public endpoints
listingRouter.get('/', controller.getAllPublic);

// This must be before '/:id', otherwise Express treats "my-listings" as an ID.
listingRouter.get(
  '/my-listings',
  authenticate,
  requireRole('host'),
  controller.getMyListings,
);

listingRouter.post(
  '/',
  authenticate,
  requireRole('host'),
  validate(validateCreateListing),
  controller.create,
);

listingRouter.get('/:id', controller.getOnePublic);

listingRouter.put(
  '/:id',
  authenticate,
  requireRole('host'),
  validate(validateUpdateListing),
  controller.update,
);

listingRouter.delete(
  '/:id',
  authenticate,
  requireRole('host'),
  controller.remove,
);

export default listingRouter;