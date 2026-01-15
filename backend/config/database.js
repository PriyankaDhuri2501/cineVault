import mongoose from 'mongoose';

// Cache connection for serverless environments
let cachedConnection = null;

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI is not defined in environment variables');
      throw new Error('MONGODB_URI is not defined');
    }

    // Return cached connection if available (for serverless)
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return cachedConnection;
    }

    // Close existing connection if it exists but is not ready
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    console.log('🔄 Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    cachedConnection = conn;

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
      cachedConnection = null;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
      cachedConnection = null;
    });

    // Only set up process handlers in non-serverless environments
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    }

    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    cachedConnection = null;
    throw error;
  }
};

export default connectDB;

