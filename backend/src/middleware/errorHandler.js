import multer from 'multer';

import ApiError from '../utils/ApiError.js';

export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} was not found.`,
  });
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Image files must be 5 MB or smaller.'
        : 'File upload failed.';

    return res.status(400).json({
      success: false,
      message,
    });
  }

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
      message: 'This record already exists.',
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message || 'Something went wrong. Please try again later.',
  });
}