import { ForbiddenError } from '../utils/errors.js';

/**
 * Role-Based Access Control Middleware
 * Checks if user has required role (admin) to access route
 * 
 * Flow:
 * 1. Check if user is authenticated (req.user should exist from protect middleware)
 * 2. Verify user role is 'admin'
 * 3. Allow or deny access
 * 
 * Must be used AFTER protect middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by protect middleware)
    if (!req.user) {
      return next(new ForbiddenError('User not authenticated'));
    }

    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `User role '${req.user.role}' is not authorized to access this route`
        )
      );
    }

    // User has required role, continue
    next();
  };
};

// Convenience middleware for admin-only routes
export const isAdmin = authorize('admin');

