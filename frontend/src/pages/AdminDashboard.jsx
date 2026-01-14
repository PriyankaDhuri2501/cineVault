import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  Movie as MovieIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import MovieForm from '../components/admin/MovieForm';
import MoviesTable from '../components/admin/MoviesTable';
import BulkMovieUpload from '../components/admin/BulkMovieUpload';
import AdminUsersManager from '../components/admin/AdminUsersManager';
import ConfirmationModal from '../components/common/ConfirmationModal';
import api from '../utils/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  // Tab mapping: 0=Movies, 1=Bulk Upload, 2=Users
  const initialTab = tabParam === 'users' ? 2 : tabParam === 'bulk' ? 1 : 0;
  const [tabValue, setTabValue] = useState(initialTab);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openMovieDialog, setOpenMovieDialog] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  // Sync tab with URL param
  useEffect(() => {
    if (tabParam === 'users') {
      setTabValue(2);
    } else if (tabParam === 'bulk') {
      setTabValue(1);
    } else {
      setTabValue(0);
    }
  }, [tabParam]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/movies', { params: { limit: 1000 } }); // Get all movies for admin
      setMovies(response.data.data.movies);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenMovieDialog = (movie = null) => {
    setSelectedMovie(movie);
    setOpenMovieDialog(true);
  };

  const handleCloseMovieDialog = () => {
    setOpenMovieDialog(false);
    setSelectedMovie(null);
  };

  const handleMovieSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      if (selectedMovie) {
        // Update movie
        await api.put(`/movies/${selectedMovie._id}`, formData);
        setSuccess('Movie updated successfully');
      } else {
        // Create movie
        await api.post('/movies', formData);
        setSuccess('Movie created successfully');
      }

      // Only close dialog and refresh on success
      handleCloseMovieDialog();
      fetchMovies();
    } catch (err) {
      // Show detailed error message
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error?.message || 
                          'Operation failed. Please check all fields and try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (movie) => {
    setSelectedMovie(movie);
    setOpenDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setError('');
      await api.delete(`/movies/${selectedMovie._id}`);
      setSuccess('Movie deleted successfully');
      setOpenDeleteModal(false);
      setSelectedMovie(null);
      fetchMovies();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete movie');
      setOpenDeleteModal(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back, {user?.username}! Manage movies and users from here.
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Paper
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            '& .MuiTab-root': {
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Tab
            icon={<MovieIcon />}
            iconPosition="start"
            label="Movies"
            sx={{ minHeight: 72 }}
          />
          <Tab
            icon={<CloudUploadIcon />}
            iconPosition="start"
            label="Bulk Upload"
            sx={{ minHeight: 72 }}
          />
          <Tab
            icon={<PeopleIcon />}
            iconPosition="start"
            label="Users"
            sx={{ minHeight: 72 }}
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <Box>
        {/* Movies Tab */}
        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Movie Management
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  // Go to Bulk Upload tab (index 1)
                  onClick={() => setTabValue(1)}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(229, 9, 20, 0.1)',
                    },
                  }}
                >
                  Bulk Upload
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenMovieDialog()}
                  sx={{
                    background: 'linear-gradient(45deg, #e50914, #f40612)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #f40612, #b20710)',
                    },
                  }}
                >
                  Add Movie
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <MoviesTable
                movies={movies}
                onEdit={handleOpenMovieDialog}
                onDelete={handleDeleteClick}
              />
            )}
          </Box>
        )}

        {/* Bulk Upload Tab */}
        {tabValue === 1 && (
          <BulkMovieUpload
            onSuccess={() => {
              fetchMovies();
              setTabValue(0); // Switch back to movies tab
            }}
          />
        )}

        {/* Users Tab */}
        {tabValue === 2 && <AdminUsersManager />}
      </Box>

      {/* Add/Edit Movie Dialog */}
      <Dialog
        open={openMovieDialog}
        onClose={handleCloseMovieDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedMovie ? 'Edit Movie' : 'Add New Movie'}
          </Typography>
          <IconButton onClick={handleCloseMovieDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <MovieForm
            movie={selectedMovie}
            onSubmit={handleMovieSubmit}
            onCancel={handleCloseMovieDialog}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedMovie(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Movie"
        message={`Are you sure you want to delete "${selectedMovie?.title}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </Container>
  );
};

export default AdminDashboard;
