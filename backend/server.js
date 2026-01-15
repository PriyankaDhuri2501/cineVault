/**
 * Local Development Server
 * This file is used for local development only
 * For Vercel deployment, use api/index.js
 */

import app from './app.js';
import connectDB from './config/database.js';

// Connect to MongoDB for local development
connectDB();

// Start server (only for local development)
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${ENV} mode on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API Base: http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});

