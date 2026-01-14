import mongoose from 'mongoose';
const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true, // Index for search
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [600, 'Duration cannot exceed 600 minutes'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [0, 'Rating must be between 0 and 10'],
      max: [10, 'Rating must be between 0 and 10'],
    },
    poster: {
      type: String,
      trim: true,
      default: '',
    },
    trailerId: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function(v) {
         
          return !v || /^[a-zA-Z0-9_-]{11}$/.test(v);
        },
        message: 'Trailer ID must be a valid YouTube video ID (11 characters)',
      },
    },
    streamingLinks: [
      {
        platform: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          required: true,
          trim: true,
          validate: {
            validator: function(v) {
              try {
                new URL(v);
                return true;
              } catch {
                return false;
              }
            },
            message: 'Streaming link must be a valid URL',
          },
        },
      },
    ],
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ releaseDate: 1 });
movieSchema.index({ rating: -1 });
movieSchema.index({ duration: 1 });

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;

