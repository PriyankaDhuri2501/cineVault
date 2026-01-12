# Backend API - MERN Movie Application

## Quick Setup

1. Install dependencies: `npm install`
2. Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/movie-app
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```
3. Run: `npm run dev`

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register user (email must be @gmail.com)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected: requires `Authorization: Bearer <token>`)

### Admin Setup
```bash
npm run create-admin
```
Default: `admin@gmail.com` / `admin123`

## Project Structure
```
backend/
├── config/       # Database, JWT config
├── controllers/  # Route handlers
├── middleware/   # Auth, error handling, validation
├── models/       # Database schemas
├── routes/       # API routes
└── utils/        # Helpers, errors
```
