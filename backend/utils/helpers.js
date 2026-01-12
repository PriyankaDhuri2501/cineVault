/**
 * Utility Helper Functions
 */

/**
 * Async handler wrapper to catch errors in async route handlers
 * Eliminates need for try-catch blocks in every route
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Format error response for development
 */
export const formatError = (err) => {
  return {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    ...(err.errors && { errors: err.errors }),
  };
};

