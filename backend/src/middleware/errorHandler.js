import ApiError from '../utils/ApiError.js';

export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} was not found.`,
  });
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {}),
    });
  }

  if (error.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Email is already registered.',
      errors: [{ field: 'email', message: 'Email is already registered.' }],
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
  });
}