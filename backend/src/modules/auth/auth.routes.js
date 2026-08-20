import { Router } from 'express';

import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validate } from '../../middleware/validate.js';
import * as controller from './auth.controller.js';
import {
  validateHostVerification,
  validateLogin,
  validateRegister,
  validateUpdateProfile,
} from './auth.validators.js';

const authRouter = Router();
const hostRouter = Router();

// Public authentication endpoints
authRouter.post(
  '/register',
  validate(validateRegister),
  controller.register,
);

authRouter.post(
  '/login',
  validate(validateLogin),
  controller.login,
);

// Logged-in user endpoints
authRouter.get(
  '/me',
  authenticate,
  controller.getMe,
);

authRouter.put(
  '/me',
  authenticate,
  validate(validateUpdateProfile),
  controller.updateMe,
);

authRouter.delete(
  '/me',
  authenticate,
  controller.deleteMe,
);

// Host-only identity verification endpoint
hostRouter.put(
  '/verification',
  authenticate,
  requireRole('host'),
  validate(validateHostVerification),
  controller.verifyHostIdentity,
);

export { authRouter, hostRouter };