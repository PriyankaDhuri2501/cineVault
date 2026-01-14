import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Paper,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import api from '../../utils/api';

const BulkMovieUpload = ({ onSuccess }) => {
  const [movies, setMovies] = useState([{ title: '', description: '', releaseDate: '', duration: '', rating: '', poster: '', trailerId: '', streamingLinks: '' }]);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [queueStatus, setQueueStatus] = useState(null);

  const handleAddRow = () => {
    setMovies([...movies, { title: '', description: '', releaseDate: '', duration: '', rating: '', poster: '', trailerId: '', streamingLinks: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (movies.length > 1) {
      setMovies(movies.filter((_, i) => i !== index));
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...movies];
    updated[index][field] = value;
    setMovies(updated);
    setError('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (Array.isArray(json)) {
          // Ensure all movies have the required fields structure
          const normalizedMovies = json.map(movie => ({
            title: movie.title || '',
            description: movie.description || '',
            releaseDate: movie.releaseDate || '',
            duration: movie.duration || '',
            rating: movie.rating || '',
            poster: movie.poster || '',
            trailerId: movie.trailerId || '',
            streamingLinks: movie.streamingLinks || [],
          }));
          setMovies(normalizedMovies);
          setSuccess(`Loaded ${json.length} movies from file`);
        } else {
          setError('File must contain a JSON array of movies');
        }
      } catch (err) {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const validateMovies = () => {
    const errors = [];
    movies.forEach((movie, index) => {
      if (!movie.title) errors.push(`Movie ${index + 1}: Title is required`);
      if (!movie.description) errors.push(`Movie ${index + 1}: Description is required`);
      if (!movie.releaseDate) errors.push(`Movie ${index + 1}: Release date is required`);
      if (!movie.duration || isNaN(movie.duration) || parseInt(movie.duration) < 1) {
        errors.push(`Movie ${index + 1}: Valid duration is required`);
      }
      if (!movie.rating || isNaN(movie.rating) || parseFloat(movie.rating) < 0 || parseFloat(movie.rating) > 10) {
        errors.push(`Movie ${index + 1}: Valid rating (0-10) is required`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('. '));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateMovies()) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Format movies for API
      const formattedMovies = [];
      for (const movie of movies) {
        // Parse streamingLinks if it's a string, otherwise use as-is
        let streamingLinks = [];
        if (movie.streamingLinks) {
          if (typeof movie.streamingLinks === 'string') {
            try {
              streamingLinks = movie.streamingLinks.trim() ? JSON.parse(movie.streamingLinks) : [];
            } catch (e) {
              setError(`Invalid streamingLinks JSON format for movie: ${movie.title || 'Unknown'}. Please check the JSON format.`);
              setLoading(false);
              return;
            }
          } else if (Array.isArray(movie.streamingLinks)) {
            streamingLinks = movie.streamingLinks;
          }
        }

        formattedMovies.push({
          title: movie.title.trim(),
          description: movie.description.trim(),
          releaseDate: movie.releaseDate,
          duration: parseInt(movie.duration),
          rating: parseFloat(movie.rating),
          poster: movie.poster?.trim() || '',
          trailerId: movie.trailerId?.trim() || '',
          streamingLinks: streamingLinks,
        });
      }

      const response = await api.post('/movies/bulk', { movies: formattedMovies });

      setSuccess(response.data.message);
      setQueueStatus(response.data.data);

      // Clear form after successful submission
      setTimeout(() => {
        setMovies([{ title: '', description: '', releaseDate: '', duration: '', rating: '', poster: '', trailerId: '', streamingLinks: '' }]);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload movies');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await api.get('/movies/queue/status');
      setQueueStatus(response.data.data.queue);
      setSuccess('Queue status updated');
    } catch (err) {
      setError('Failed to get queue status');
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Bulk Movie Upload
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            sx={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
          >
            Upload JSON
            <input
              type="file"
              hidden
              accept=".json"
              onChange={handleFileUpload}
            />
          </Button>
          <Button
            variant="outlined"
            onClick={handleCheckStatus}
            sx={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
            disabled={checkingStatus}
          >
            {checkingStatus ? 'Checking...' : 'Check Queue Status'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
          {queueStatus && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption">
                Queue: {queueStatus.queueLength} items | Processing: {queueStatus.processing ? 'Yes' : 'No'} | 
                Processed: {queueStatus.stats?.processed || 0} | Failed: {queueStatus.stats?.failed || 0}
              </Typography>
            </Box>
          )}
        </Alert>
      )}

      <Paper
        sx={{
          p: 3,
          backgroundColor: 'background.paper',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          maxHeight: '600px',
          overflow: 'auto',
        }}
      >
        {movies.map((movie, index) => (
          <Box
            key={index}
            sx={{
              mb: 3,
              p: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Movie {index + 1}
              </Typography>
              {movies.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() => handleRemoveRow(index)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Title *"
                value={movie.title}
                onChange={(e) => handleChange(index, 'title', e.target.value)}
                size="small"
                required
              />
              <TextField
                fullWidth
                label="Release Date *"
                type="date"
                value={movie.releaseDate}
                onChange={(e) => handleChange(index, 'releaseDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="Description *"
                value={movie.description}
                onChange={(e) => handleChange(index, 'description', e.target.value)}
                size="small"
                multiline
                rows={2}
                required
              />
              <TextField
                fullWidth
                label="Poster URL"
                value={movie.poster}
                onChange={(e) => handleChange(index, 'poster', e.target.value)}
                size="small"
                placeholder="https://example.com/poster.jpg"
              />
              <TextField
                fullWidth
                label="Duration (minutes) *"
                type="number"
                value={movie.duration}
                onChange={(e) => handleChange(index, 'duration', e.target.value)}
                size="small"
                inputProps={{ min: 1, max: 600 }}
                required
              />
              <TextField
                fullWidth
                label="Rating (0-10) *"
                type="number"
                value={movie.rating}
                onChange={(e) => handleChange(index, 'rating', e.target.value)}
                size="small"
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                required
              />
              <TextField
                fullWidth
                label="YouTube Trailer ID (optional)"
                value={movie.trailerId || ''}
                onChange={(e) => handleChange(index, 'trailerId', e.target.value)}
                size="small"
                placeholder="dQw4w9WgXcQ"
                helperText="11-character YouTube video ID"
              />
              <TextField
                fullWidth
                label="Streaming Links (optional - JSON array)"
                value={typeof movie.streamingLinks === 'string' ? movie.streamingLinks : JSON.stringify(movie.streamingLinks || [], null, 2)}
                onChange={(e) => handleChange(index, 'streamingLinks', e.target.value)}
                size="small"
                multiline
                rows={3}
                placeholder='[{"platform": "Netflix", "url": "https://..."}]'
                helperText='JSON array: [{"platform": "Platform Name", "url": "https://..."}]'
                sx={{
                  gridColumn: { xs: '1 / -1', md: '1 / -1' },
                }}
              />
            </Box>
          </Box>
        ))}

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
            sx={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
          >
            Add Another Movie
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={`${movies.length} movie(s) ready to upload`}
            color="primary"
            sx={{ alignSelf: 'center' }}
          />
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
            onClick={handleSubmit}
            disabled={loading || movies.length === 0}
            sx={{
              background: 'linear-gradient(45deg, #e50914, #f40612)',
              '&:hover': {
                background: 'linear-gradient(45deg, #f40612, #b20710)',
              },
            }}
          >
            {loading ? 'Uploading...' : `Upload ${movies.length} Movie(s)`}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
          📝 How to Import Bulk Data:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Prepare a JSON file with an array of movie objects</li>
            <li>Each movie should have: title, description, releaseDate (YYYY-MM-DD), duration (minutes), rating (0-10), poster (optional URL), trailerId (optional), streamingLinks (optional array)</li>
            <li>Click "Upload JSON" and select your file</li>
            <li>Or manually add movies using the form above</li>
            <li>Click "Upload" to queue movies for processing</li>
            <li>Movies will be processed asynchronously in the background</li>
          </ol>
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            Example JSON format:
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 1,
              fontSize: '0.75rem',
              overflow: 'auto',
            }}
          >
{`[
  {
    "title": "Movie Title",
    "description": "Movie description",
    "releaseDate": "2024-01-15",
    "duration": 120,
    "rating": 8.5,
    "poster": "https://example.com/poster.jpg",
    "trailerId": "dQw4w9WgXcQ",
    "streamingLinks": [
      {
        "platform": "Netflix",
        "url": "https://www.netflix.com/title/..."
      },
      {
        "platform": "Amazon Prime",
        "url": "https://www.amazon.com/..."
      }
    ]
  }
]`}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BulkMovieUpload;
