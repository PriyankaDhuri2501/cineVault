import express from 'express';
import { body } from 'express-validator';
import {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  searchMovies,
  getSortedMovies,
} from '../controllers/movie.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * Validation rules for creating/updating movies
 */
const movieValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('releaseDate')
    .notEmpty()
    .withMessage('Release date is required')
    .isISO8601()
    .withMessage('Release date must be a valid date (ISO 8601 format)'),
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 1, max: 600 })
    .withMessage('Duration must be between 1 and 600 minutes'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Rating must be between 0 and 10'),
  body('poster')
    .optional()
    .isURL()
    .withMessage('Poster must be a valid URL'),
];

/**
 * @route   GET /api/movies/search
 * @desc    Search movies by name or description
 * @access  Public
 * @query   q - Search query string
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 */
router.get('/search', searchMovies);

/**
 * @route   GET /api/movies/sorted
 * @desc    Get movies sorted by field
 * @access  Public
 * @query   sortBy - Field to sort by (title, rating, releaseDate, duration)
 * @query   order - Sort order (asc, desc) - default: desc
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 */
router.get('/sorted', getSortedMovies);

/**
 * @route   GET /api/movies
 * @desc    Get all movies (with pagination)
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 */
router.get('/', getAllMovies);

/**
 * @route   GET /api/movies/:id
 * @desc    Get single movie by ID
 * @access  Public
 */
router.get('/:id', getMovieById);

/**
 * @route   POST /api/movies
 * @desc    Create a new movie
 * @access  Private/Admin
 */
router.post('/', protect, isAdmin, movieValidation, validate, createMovie);

/**
 * @route   PUT /api/movies/:id
 * @desc    Update a movie
 * @access  Private/Admin
 */
router.put('/:id', protect, isAdmin, movieValidation, validate, updateMovie);

/**
 * @route   DELETE /api/movies/:id
 * @desc    Delete a movie
 * @access  Private/Admin
 */
router.delete('/:id', protect, isAdmin, deleteMovie);

export default router;

