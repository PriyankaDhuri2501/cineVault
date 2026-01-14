import { AppError } from '../utils/errors.js';
import { formatError } from '../utils/helpers.js';
import { sanitizeError } from '../utils/responseSanitizer.js';


export const errorHandler = (err, req, res, next) => {
  // Default error
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} already exists`;
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    const message = messages.join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // Send error response (sanitized)
  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Sanitize error response
  const sanitizedError = sanitizeError(error, isDevelopment);

  res.status(statusCode).json({
    status,
    message: sanitizedError.message || 'Internal Server Error',
    ...(isDevelopment && {
      stack: sanitizedError.stack,
      error: formatError(err),
    }),
  });
};

/**
 * 404 Not Found Handler
 * Catches routes that don't exist
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

