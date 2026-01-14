import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Sort as SortIcon,
  Search as SearchIcon,
  Movie as MovieIcon,
} from '@mui/icons-material';
import MovieCard from '../components/movies/MovieCard';
import api from '../utils/api';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [limit] = useState(12); 

  useEffect(() => {
    fetchMovies();
  }, [page, sortBy, sortOrder]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError('');

      let response;
      if (sortBy === 'createdAt') {
        response = await api.get('/movies', {
          params: {
            page,
            limit,
          },
        });
      } else {
        response = await api.get('/movies/sorted', {
          params: {
            sortBy,
            order: sortOrder,
            page,
            limit,
          },
        });
      }

      setMovies(response.data.data.movies);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load movies. Please try again.'
      );
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    if (value === 'createdAt') {
      setSortBy('createdAt');
      setSortOrder('desc');
    } else {
      setSortBy(value);
      setSortOrder('desc');
    }
    setPage(1); 
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MovieIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Discover Movies
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <FormControl
            size="small"
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <InputLabel id="sort-label">Sort By</InputLabel>
            <Select
              labelId="sort-label"
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon sx={{ color: 'text.secondary', mr: 1 }} />
                </InputAdornment>
              }
            >
              <MenuItem value="createdAt">Newest First</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
              <MenuItem value="releaseDate">Release Date</MenuItem>
              <MenuItem value="title">Title (A-Z)</MenuItem>
              <MenuItem value="duration">Duration</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Results Count */}
        {!loading && (
          <Typography variant="body2" color="text.secondary">
            Showing {movies.length} of {total} movies
          </Typography>
        )}
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <CircularProgress size={60} />
        </Box>
      ) : movies.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <MovieIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" sx={{ mb: 1 }}>
            No Movies Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for new releases!
          </Typography>
        </Box>
      ) : (
        <>
          {/* Movies Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(5, 1fr)',
                xl: 'repeat(6, 1fr)',
              },
              gap: 3,
              mb: 4,
            }}
          >
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 4,
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: 'text.primary',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default HomePage;
