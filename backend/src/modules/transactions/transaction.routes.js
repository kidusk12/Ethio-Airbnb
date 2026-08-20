import { Router } from 'express';

import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { allTransactions } from './transaction.controller.js';

const transactionRouter = Router();

transactionRouter.use(authenticate, requireRole('admin'));

transactionRouter.get('/', allTransactions);

export default transactionRouter;