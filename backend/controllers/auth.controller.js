import jwt from 'jsonwebtoken';
import { ValidationError, UnauthorizedError } from '../utils/errors.js';
import { jwtConfig } from '../config/jwt.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/helpers.js';

/**
 * Generate JWT Token
 * Creates a signed JWT token with user information
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 * 
 * Flow:
 * 1. Validate input data
 * 2. Check if user already exists
 * 3. Create new user (password will be hashed by pre-save hook)
 * 4. Generate JWT token
 * 5. Return token and user data
 */
export const signup = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  // Validation
  if (!username || !email || !password) {
    return next(new ValidationError('Please provide username, email, and password'));
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return next(new ValidationError('User with this email or username already exists'));
  }

  // Create user
  // Password will be automatically hashed by pre-save hook in User model
  const user = await User.create({
    username,
    email,
    password,
    role: 'user', // Default role
  });

  // Generate token
  const token = generateToken(user._id);

  // Send response
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 * 
 * Flow:
 * 1. Validate email/username and password
 * 2. Find user by email or username
 * 3. Check if password matches
 * 4. Generate JWT token
 * 5. Return token and user data
 */
export const login = asyncHandler(async (req, res, next) => {
  const { emailOrUsername, password } = req.body;

  // Validation
  if (!emailOrUsername || !password) {
    return next(new ValidationError('Please provide email/username and password'));
  }

  // Find user by email or username
  // select('+password') is needed because password field is set to select: false in schema
  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  }).select('+password');

  if (!user) {
    return next(new UnauthorizedError('Invalid credentials'));
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return next(new UnauthorizedError('Invalid credentials'));
  }

  // Generate token
  const token = generateToken(user._id);

  // Send response
  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Protected (requires authentication)
 * 
 * Flow:
 * 1. User is already authenticated (protect middleware)
 * 2. req.user contains current user
 * 3. Return user data
 */
export const getMe = asyncHandler(async (req, res, next) => {
  // User is already attached to req.user by protect middleware
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
  });
});

