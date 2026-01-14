import { NotFoundError, ValidationError } from '../utils/errors.js';
import { asyncHandler } from '../utils/helpers.js';
import { sanitizeMovie, sanitizeMovies } from '../utils/responseSanitizer.js';
import movieQueue from '../utils/movieQueue.js';
import Movie from '../models/Movie.js';


export const getAllMovies = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 per page
  const skip = (page - 1) * limit;

  const movies = await Movie.find()
    .select('title description releaseDate duration rating poster trailerId streamingLinks addedBy createdAt')
    .populate('addedBy', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(); 

  // Get total count (optimized with estimatedDocumentCount for large collections)
  const total = await Movie.estimatedDocumentCount();

  // Sanitize response
  const sanitizedMovies = sanitizeMovies(movies);

  res.status(200).json({
    status: 'success',
    results: sanitizedMovies.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      movies: sanitizedMovies,
    },
  });
});


export const getMovieById = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id)
    .select('title description releaseDate duration rating poster trailerId streamingLinks addedBy createdAt')
    .populate('addedBy', 'username email')
    .lean();

  if (!movie) {
    return next(new NotFoundError('Movie not found'));
  }

  // Sanitize response
  const sanitizedMovie = sanitizeMovie(movie);

  res.status(200).json({
    status: 'success',
    data: {
      movie: sanitizedMovie,
    },
  });
});


export const createMovie = asyncHandler(async (req, res, next) => {
  // Add the admin user ID to the movie
  req.body.addedBy = req.user._id;

  const movie = await Movie.create(req.body);

  // Sanitize response
  const sanitizedMovie = sanitizeMovie(movie);

  res.status(201).json({
    status: 'success',
    message: 'Movie created successfully',
    data: {
      movie: sanitizedMovie,
    },
  });
});


export const createBulkMovies = asyncHandler(async (req, res, next) => {
  const { movies } = req.body;

  if (!movies || !Array.isArray(movies)) {
    return next(new ValidationError('Movies array is required'));
  }

  if (movies.length === 0) {
    return next(new ValidationError('Movies array cannot be empty'));
  }

  if (movies.length > 100) {
    return next(new ValidationError('Cannot add more than 100 movies at once'));
  }

  // Validate each movie
  const validatedMovies = [];
  const errors = [];

  movies.forEach((movie, index) => {
    try {
      if (!movie.title || !movie.description || !movie.releaseDate || !movie.duration || !movie.rating) {
        errors.push({ index, error: 'Missing required fields' });
        return;
      }

      validatedMovies.push({
        ...movie,
        addedBy: req.user._id,
      });
    } catch (error) {
      errors.push({ index, error: error.message });
    }
  });

  if (validatedMovies.length === 0) {
    return next(new ValidationError('No valid movies to add'));
  }

  // Add to queue for async processing
  movieQueue.enqueue(validatedMovies);

  // Return immediately with queue status
  const queueStatus = movieQueue.getStatus();

  res.status(202).json({
    status: 'accepted',
    message: `${validatedMovies.length} movie(s) queued for processing`,
    data: {
      queued: validatedMovies.length,
      totalInQueue: queueStatus.queueLength,
      processing: queueStatus.processing,
      errors: errors.length > 0 ? errors : undefined,
    },
  });
});


export const getQueueStatus = asyncHandler(async (req, res, next) => {
  const status = movieQueue.getStatus();

  res.status(200).json({
    status: 'success',
    data: {
      queue: status,
    },
  });
});


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

  // Sanitize response
  const sanitizedMovie = sanitizeMovie(movie);

  res.status(200).json({
    status: 'success',
    message: 'Movie updated successfully',
    data: {
      movie: sanitizedMovie,
    },
  });
});

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


export const searchMovies = asyncHandler(async (req, res, next) => {
  const { q } = req.query; // Query parameter for search term
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!q || q.trim() === '') {
    return next(new ValidationError('Search query parameter "q" is required'));
  }

  // Use regex for partial matching (case-insensitive)
  const searchTerm = q.trim();
  const searchRegex = new RegExp(searchTerm, 'i'); // 'i' flag for case-insensitive

  const searchQuery = {
    $or: [
      { title: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
    ],
  };

  // Optimized search query with lean() and field selection
  const movies = await Movie.find(searchQuery)
    .select('title description releaseDate duration rating poster trailerId streamingLinks addedBy createdAt')
    .populate('addedBy', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Movie.countDocuments(searchQuery);

  // Sanitize response
  const sanitizedMovies = sanitizeMovies(movies);

  res.status(200).json({
    status: 'success',
    results: sanitizedMovies.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    query: q,
    data: {
      movies: sanitizedMovies,
    },
  });
});


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
    results: sanitizedMovies.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    sortBy: sortField,
    order: sortOrder === 1 ? 'asc' : 'desc',
    data: {
      movies: sanitizedMovies,
    },
  });
});

