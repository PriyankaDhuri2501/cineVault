import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors.js';
import { jwtConfig } from '../config/jwt.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/helpers.js';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request object
 * 
 * Flow:
 * 1. Extract token from Authorization header
 * 2. Verify token signature
 * 3. Decode token to get userId
 * 4. Fetch user from database
 * 5. Attach user to req.user
 * 6. Continue to next middleware
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract token (format: "Bearer <token>")
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token found
  if (!token) {
    return next(new UnauthorizedError('Not authorized to access this route. Please login.'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Get user from token (decoded contains userId from token payload)
    // select('+password') is not needed here since we only verify role
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new UnauthorizedError('User not found'));
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Token is invalid or expired
    return next(new UnauthorizedError('Invalid or expired token'));
  }
});

