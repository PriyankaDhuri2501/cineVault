export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const formatError = (err) => {
  return {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    ...(err.errors && { errors: err.errors }),
  };
};

