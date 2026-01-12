import { NotFoundError, ValidationError } from '../utils/errors.js';
import { asyncHandler } from '../utils/helpers.js';
import Movie from '../models/Movie.js';

/**
 * @route   GET /api/movies
 * @desc    Get all movies with pagination
 * @access  Public
 */
export const getAllMovies = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query
  const query = Movie.find().populate('addedBy', 'username email');

  // Execute query with pagination
  const movies = await query.sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await Movie.countDocuments();

  res.status(200).json({
    status: 'success',
    results: movies.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      movies,
    },
  });
});

/**
 * @route   GET /api/movies/:id
 * @desc    Get single movie by ID
 * @access  Public
 */
export const getMovieById = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id).populate(
    'addedBy',
    'username email'
  );

  if (!movie) {
    return next(new NotFoundError('Movie not found'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      movie,
    },
  });
});

/**
 * @route   POST /api/movies
 * @desc    Create a new movie (Admin only)
 * @access  Private/Admin
 */
export const createMovie = asyncHandler(async (req, res, next) => {
  // Add the admin user ID to the movie
  req.body.addedBy = req.user._id;

  const movie = await Movie.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Movie created successfully',
    data: {
      movie,
    },
  });
});

/**
 * @route   PUT /api/movies/:id
 * @desc    Update a movie (Admin only)
 * @access  Private/Admin
 */
export const updateMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    return next(new NotFoundError('Movie not found'));
  }

  // Update movie fields
  Object.keys(req.body).forEach((key) => {
    movie[key] = req.body[key];
  });

  await movie.save();

  res.status(200).json({
    status: 'success',
    message: 'Movie updated successfully',
    data: {
      movie,
    },
  });
});

/**
 * @route   DELETE /api/movies/:id
 * @desc    Delete a movie (Admin only)
 * @access  Private/Admin
 */
export const deleteMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    return next(new NotFoundError('Movie not found'));
  }

  await Movie.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Movie deleted successfully',
    data: null,
  });
});

/**
 * @route   GET /api/movies/search
 * @desc    Search movies by name or description
 * @access  Public
 */
export const searchMovies = asyncHandler(async (req, res, next) => {
  const { q } = req.query; // Query parameter for search term
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!q || q.trim() === '') {
    return next(new ValidationError('Search query parameter "q" is required'));
  }

  // Use MongoDB text search (requires text index on title and description)
  const searchQuery = {
    $text: { $search: q.trim() },
  };

  // Execute search with pagination
  const movies = await Movie.find(searchQuery)
    .populate('addedBy', 'username email')
    .sort({ score: { $meta: 'textScore' } }) // Sort by relevance score
    .skip(skip)
    .limit(limit);

  const total = await Movie.countDocuments(searchQuery);

  res.status(200).json({
    status: 'success',
    results: movies.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    query: q,
    data: {
      movies,
    },
  });
});

/**
 * @route   GET /api/movies/sorted
 * @desc    Get movies sorted by name, rating, release date, or duration
 * @access  Public
 */
export const getSortedMovies = asyncHandler(async (req, res, next) => {
  const { sortBy, order } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Define allowed sort fields
  const allowedSortFields = ['title', 'rating', 'releaseDate', 'duration'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  // Build sort object
  const sortObject = { [sortField]: sortOrder };

  // Execute query with sorting and pagination
  const movies = await Movie.find()
    .populate('addedBy', 'username email')
    .sort(sortObject)
    .skip(skip)
    .limit(limit);

  const total = await Movie.countDocuments();

  res.status(200).json({
    status: 'success',
    results: movies.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    sortBy: sortField,
    order: sortOrder === 1 ? 'asc' : 'desc',
    data: {
      movies,
    },
  });
});

