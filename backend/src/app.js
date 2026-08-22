import path from 'path';
import adminRouter from './modules/admin/admin.routes.js';
import bookingRouter from './modules/bookings/booking.routes.js';

import cors from 'cors';
import express from 'express';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRouter, hostRouter } from './modules/auth/auth.routes.js';
import listingRouter from './modules/listings/listing.routes.js';
import { adminPaymentRouter, bookingPaymentRouter } from './modules/payments/payment.routes.js';
import payoutRouter from './modules/payouts/payout.routes.js';
import transactionRouter from './modules/transactions/transaction.routes.js';
import uploadRouter from './modules/uploads/uploads.routes.js';

import {
  adminReviewRouter,
  bookingReviewRouter,
  publicReviewRouter,
} from './modules/reviews/review.routes.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') ?? true,
  }),
);

app.use(express.json());

// Uploaded files are accessible through: http://localhost:5000/uploads/file.jpg
app.use('/uploads', cors({ origin: process.env.CLIENT_ORIGIN?.split(',') ?? true }), express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'ok' },
  });
});

app.use('/api/auth', authRouter);
app.use('/api/hosts', hostRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api/listings', listingRouter);
app.use('/api/admin/payments', adminPaymentRouter);
app.use('/api/admin/payouts', payoutRouter);
app.use('/api/admin/transactions', transactionRouter);
app.use('/api/admin', adminRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/bookings', bookingPaymentRouter);
app.use('/api/reviews', publicReviewRouter);
app.use('/api/bookings', bookingReviewRouter);
app.use('/api/admin/reviews', adminReviewRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;