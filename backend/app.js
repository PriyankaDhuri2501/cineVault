import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import authRoutes from './routes/auth.routes.js';
import movieRoutes from './routes/movie.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.VERCEL_FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // In development, allow all origins for easier testing
        if (process.env.NODE_ENV === 'development') {
          callback(null, true);
        } else {
          // In production, check if it's a Vercel preview URL
          // Vercel preview URLs follow pattern: https://*-*.vercel.app
          const isVercelPreview = origin.includes('.vercel.app');
          if (isVercelPreview) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
  })
);

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Apply rate limiting to all routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler (must be after all routes)
app.use(notFoundHandler);

// Global Error Handler (must be last middleware)
app.use(errorHandler);

// Connect to MongoDB (only in non-serverless environments)
// In serverless, connection is handled per-request
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB();
}

export default app;
