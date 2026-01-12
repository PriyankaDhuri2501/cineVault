import express from 'express';
import { body } from 'express-validator';
import { signup, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * Validation rules for signup
 */
const signupValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .matches(/^[a-zA-Z0-9._-]+@gmail\.com$/)
    .withMessage('Email must be a Gmail address (@gmail.com)'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('emailOrUsername')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', authLimiter, signupValidation, validate, signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, loginValidation, validate, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Protected
 */
router.get('/me', protect, getMe);

export default router;

