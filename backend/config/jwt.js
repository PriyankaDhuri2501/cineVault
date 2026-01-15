/**
 * JWT Configuration
 * Centralized JWT settings
 */
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  
  // In production, JWT_SECRET must be set
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  
  // In development, use fallback but warn
  if (!secret) {
    console.warn('⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET in production!');
    return 'fallback_secret_change_in_production';
  }
  
  // Validate secret strength in production
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long');
  }
  
  return secret;
};

export const jwtConfig = {
  secret: getJWTSecret(),
  expiresIn: process.env.JWT_EXPIRE || '7d',
};

export default jwtConfig;

