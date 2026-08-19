import cors from 'cors';
import express from 'express';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRouter, hostRouter } from './modules/auth/auth.routes.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') ?? true,
  }),
);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'ok' },
  });
});

app.use('/api/auth', authRouter);
app.use('/api/hosts', hostRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;