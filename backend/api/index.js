/**
 * Vercel Serverless Function Entry Point
 * This file is the entry point for Vercel serverless functions
 * Located at: backend/api/index.js
 * 
 * Vercel will route all requests to /api/* to this function
 */

import app from '../app.js';
import connectDB from '../config/database.js';

// Cache MongoDB connection for serverless (reuse across invocations)
let isConnected = false;

async function ensureDatabaseConnection() {
  if (isConnected) {
    return;
  }

  try {
    await connectDB();
    isConnected = true;
    console.log('✅ MongoDB connected for serverless function');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
}

// Vercel serverless function handler
export default async function handler(req, res) {
  // Ensure MongoDB connection before handling request
  try {
    await ensureDatabaseConnection();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }

  // Handle the request with Express app
  // Express app will handle routing, middleware, etc.
  return app(req, res);
}
