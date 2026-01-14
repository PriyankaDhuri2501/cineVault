import SimpleQueue from './queue.js';
import Movie from '../models/Movie.js';

// Create queue instance
const movieQueue = new SimpleQueue(
  async (batch) => {
    const moviesToInsert = batch.map(movie => ({
      ...movie,
      addedBy: movie.addedBy, // Should be set before adding to queue
    }));

    // Use insertMany for better performance
    await Movie.insertMany(moviesToInsert, {
      ordered: false,
    });
  },
  10, // Batch size: process 10 movies at a time
  50  
);

export default movieQueue;
