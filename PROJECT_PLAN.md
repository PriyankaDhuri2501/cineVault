# MERN Stack Movie Application - Project Architecture Plan

## 📋 Overall Application Flow

### User Flow (Regular User)
```
1. Landing/Home Page
   └─> Browse all movies (paginated)
   └─> View movie details (modal/card)
   └─> Search movies
   └─> Sort movies (name, rating, release date, duration)
   └─> Login/Signup (optional - for better experience)

2. Search Page
   └─> Filter movies by name/description
   └─> Apply multiple filters
   └─> Sort results

3. Movie Details View
   └─> Display full movie information
   └─> (Non-admin users cannot edit/delete)
```

### Admin Flow
```
1. Login Page
   └─> Authenticate with admin credentials
   └─> Receive JWT token

2. Admin Dashboard/Home
   └─> View all movies with admin controls
   └─> Quick access to Add/Edit/Delete

3. Add Movie Page
   └─> Form to add new movie
   └─> Validation & image upload

4. Edit Movie Page
   └─> Pre-filled form with existing data
   └─> Update movie details

5. Delete Confirmation
   └─> Modal confirmation before deletion
```

### Authentication Flow
```
1. User Registration/Login
   └─> Frontend: Form submission
   └─> Backend: Validate credentials
   └─> Backend: Generate JWT token (with role: 'user' or 'admin')
   └─> Frontend: Store token in localStorage/context
   └─> Frontend: Redirect based on role

2. Protected Routes
   └─> Admin routes check for:
       - Valid JWT token
       - Role === 'admin'
   └─> Redirect to login if unauthorized

3. API Requests
   └─> Include JWT in Authorization header
   └─> Backend middleware verifies token
   └─> Backend checks role for admin endpoints
```

---

## 🎨 Frontend Folder Structure (React)

```
frontend/
├── public/
│   ├── favicon.ico
│   └── assets/
│       └── images/
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── movies/
│   │   │   ├── MovieCard.jsx
│   │   │   ├── MovieGrid.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   ├── MoviePagination.jsx
│   │   │   ├── MovieSort.jsx
│   │   │   └── MovieSearch.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── MovieForm.jsx
│   │   │   ├── EditMovieModal.jsx
│   │   │   └── DeleteConfirmModal.jsx
│   │   │
│   │   └── auth/
│   │       ├── LoginForm.jsx
│   │       └── SignupForm.jsx
│   │
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── SearchPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AddMoviePage.jsx
│   │   └── EditMoviePage.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── MovieContext.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── movieService.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useMovies.js
│   │
│   ├── theme/
│   │   ├── theme.js
│   │   ├── palette.js
│   │   └── typography.js
│   │
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── package.json
└── vite.config.js
```

---

## 🔧 Backend Folder Structure (Express + MongoDB)

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   ├── jwt.js               # JWT configuration
│   └── queue.js             # Queue setup (Bull/BullMQ for lazy insertion)
│
├── models/
│   ├── Movie.js             # Movie schema
│   ├── User.js              # User schema
│   └── index.js
│
├── routes/
│   ├── auth.routes.js       # Login, Signup endpoints
│   ├── movie.routes.js      # Movie CRUD endpoints
│   └── index.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── movie.controller.js
│   └── user.controller.js
│
├── middleware/
│   ├── auth.middleware.js   # JWT verification
│   ├── role.middleware.js   # Role-based access control
│   ├── error.middleware.js  # Error handling
│   ├── validation.middleware.js  # Input validation
│   └── rateLimit.middleware.js   # Rate limiting
│
├── services/
│   ├── movie.service.js     # Business logic for movies
│   ├── auth.service.js      # Authentication logic
│   ├── queue.service.js     # Queue management for lazy insertion
│   └── imdb.service.js      # IMDb data fetching/scraping
│
├── utils/
│   ├── errors.js            # Custom error classes
│   ├── validators.js        # Validation functions
│   └── helpers.js           # Utility functions
│
├── jobs/
│   └── movieSync.job.js     # Background job for syncing movies
│
├── .env.example
├── .env
├── server.js                # Entry point
└── package.json
```

---

## 🗄️ Database Schema

### User Schema
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required, validated),
  password: String (hashed with bcrypt, required),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Movie Schema
```javascript
{
  _id: ObjectId,
  title: String (required, indexed),
  description: String (required, text indexed for search),
  releaseDate: Date (required, indexed),
  duration: Number (required, in minutes),
  rating: Number (required, min: 0, max: 10, indexed),
  genre: [String],
  director: String,
  cast: [String],
  poster: String (URL),
  imdbId: String (unique, optional),
  imdbRank: Number (if from Top 250),
  addedBy: ObjectId (ref: User, admin who added),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- title: text index (for search)
- description: text index (for search)
- releaseDate: 1
- rating: -1
- duration: 1
- imdbRank: 1 (for Top 250 ordering)
```

---

## 🔐 Authentication & RBAC Flow

### Authentication Flow Diagram
```
1. Login Request
   └─> POST /api/auth/login
       └─> Validate credentials
       └─> Check user exists & password matches
       └─> Generate JWT token (payload: { userId, role, email })
       └─> Return token + user info (without password)

2. Protected API Request
   └─> Frontend: Include token in header (Authorization: Bearer <token>)
   └─> Backend: auth.middleware.js
       └─> Extract token from header
       └─> Verify token signature
       └─> Decode payload (get userId, role)
       └─> Attach user info to req.user
       └─> Next middleware

3. Role-Based Access
   └─> Admin Routes: role.middleware.js (isAdmin)
       └─> Check req.user.role === 'admin'
       └─> Allow or return 403 Forbidden

4. Token Refresh
   └─> Optional: Implement refresh token mechanism
   └─> Or: Re-login on token expiration
```

### Route Protection Strategy
```
Public Routes:
- GET /api/movies
- GET /api/movies/sorted
- GET /api/movies/search
- POST /api/auth/login
- POST /api/auth/signup

Protected Routes (Require JWT):
- POST /api/movies (admin only)
- PUT /api/movies/:id (admin only)
- DELETE /api/movies/:id (admin only)
```

### Frontend Route Protection
```
Public Pages:
- / (Home)
- /search
- /login
- /signup

Protected Admin Pages:
- /admin/dashboard
- /admin/add-movie
- /admin/edit-movie/:id

ProtectedRoute Component:
- Checks AuthContext for token & role
- Redirects to /login if not authenticated
- Redirects to / if authenticated but not admin
```

---

## 🎨 Color Palette

### Primary Palette (Dark Theme - Netflix/IMDb Inspired)
```javascript
{
  // Background Colors
  background: {
    primary: '#0a0a0a',      // Almost black (main bg)
    secondary: '#141414',    // Dark gray (cards, sections)
    tertiary: '#1a1a1a',     // Lighter dark (hover states)
  },
  
  // Text Colors
  text: {
    primary: '#ffffff',      // White (headings, important text)
    secondary: '#b3b3b3',    // Light gray (descriptions)
    tertiary: '#808080',     // Medium gray (metadata)
    muted: '#4d4d4d',        // Dark gray (disabled)
  },
  
  // Accent Colors
  accent: {
    primary: '#e50914',      // Netflix red / IMDb yellow (#F5C518)
    secondary: '#f5c518',    // IMDb yellow
    hover: '#f40612',        // Darker red on hover
    gold: '#FFD700',         // Gold for ratings
  },
  
  // Status Colors
  status: {
    success: '#46d369',      // Green
    warning: '#e87c03',      // Orange
    error: '#e50914',        // Red
    info: '#0071eb',         // Blue
  },
  
  // UI Elements
  ui: {
    border: '#333333',       // Borders, dividers
    divider: '#2a2a2a',      // Section dividers
    overlay: 'rgba(0,0,0,0.7)',  // Modal overlay
    cardHover: '#1f1f1f',    // Card hover state
  }
}
```

### Alternative Light Theme (Optional)
```javascript
{
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#e9e9e9',
  },
  text: {
    primary: '#000000',
    secondary: '#333333',
    tertiary: '#666666',
  }
}
```

---

## 📝 Typography

### Font Families
```javascript
{
  primary: "'Roboto', 'Helvetica Neue', Arial, sans-serif",  // Material-UI default
  heading: "'Montserrat', 'Roboto', sans-serif",            // For titles
  body: "'Roboto', sans-serif",                             // Body text
  mono: "'Roboto Mono', monospace",                         // Code/metadata
}
```

### Font Sizes & Weights
```javascript
{
  h1: { size: '3rem', weight: 700, lineHeight: 1.2 },      // Main titles
  h2: { size: '2.5rem', weight: 600, lineHeight: 1.3 },    // Section headers
  h3: { size: '2rem', weight: 600, lineHeight: 1.4 },      // Card titles
  h4: { size: '1.5rem', weight: 500, lineHeight: 1.4 },    // Subheadings
  h5: { size: '1.25rem', weight: 500, lineHeight: 1.5 },
  body1: { size: '1rem', weight: 400, lineHeight: 1.6 },   // Body text
  body2: { size: '0.875rem', weight: 400, lineHeight: 1.6 }, // Small text
  caption: { size: '0.75rem', weight: 400, lineHeight: 1.5 }, // Captions
  button: { size: '0.875rem', weight: 500, lineHeight: 1.75 },
}
```

---

## 🎬 UI Inspiration References

### Netflix-Inspired Elements:
- **Hero Section**: Large background image with overlay, prominent CTA
- **Row Layout**: Horizontal scrolling rows of content
- **Card Hover**: Scale up effect with title overlay
- **Dark Theme**: Deep blacks and grays
- **Typography**: Bold, clear headings
- **Navigation**: Minimalist top navigation bar

### IMDb-Inspired Elements:
- **Movie Cards**: Poster image + metadata layout
- **Rating Display**: Prominent star rating (gold/yellow)
- **Information Density**: Rich metadata (director, cast, genre)
- **Search Bar**: Prominent, autocomplete suggestions
- **Grid Layout**: Responsive grid of movie posters
- **Detail Pages**: Comprehensive movie information layout

### Prime Video-Inspired Elements:
- **Carousel**: Smooth horizontal scrolling
- **Categories**: Clear genre/category filtering
- **Responsive Design**: Mobile-first approach
- **Action Buttons**: Clear, accessible CTAs

### Combined Design Approach:
1. **Dark theme** with red/gold accents (Netflix + IMDb)
2. **Grid/Row hybrid** layout for movies
3. **Poster-focused** cards with hover effects
4. **Clean typography** hierarchy
5. **Smooth animations** and transitions
6. **Mobile-responsive** throughout

---

## 🚀 Key Technical Decisions

### State Management
- **Context API** for global state (auth, movies)
- **Local state** (useState) for component-specific data
- **Custom hooks** for reusable logic

### Data Fetching
- **React Query** (optional) or **useEffect + fetch**
- **Optimistic updates** for admin actions
- **Loading states** and error handling

### Performance Optimizations
- **Lazy loading** of images
- **Pagination** on backend (limit, skip)
- **Debounced search** (300ms delay)
- **Memoization** (React.memo, useMemo, useCallback)
- **Code splitting** (React.lazy for routes)

### Queue System (Lazy Insertion)
- **Bull/BullMQ** with Redis (for production)
- **In-memory queue** (simple array) for development
- **Background worker** to process movie insertions
- **Batch insertions** for better performance

---

## 📦 Key Dependencies

### Frontend
- React 18+
- React Router DOM
- Material-UI (MUI) v5
- Axios
- React Context API

### Backend
- Node.js 18+
- Express.js
- MongoDB (Mongoose)
- JWT (jsonwebtoken)
- bcrypt
- Bull/BullMQ (queue)
- Express Validator
- CORS
- dotenv

---

## ✅ Next Steps After Planning

Once you approve this architecture, we'll proceed with:

**Step 2**: Backend Setup
- Initialize Node.js project
- Set up Express server
- Configure MongoDB connection
- Create basic folder structure
- Set up environment variables

**Step 3**: Database Models & Schemas
- User model with authentication
- Movie model with indexes
- Validation rules

**Step 4**: Authentication System
- JWT middleware
- Login/Signup endpoints
- Role-based access control

And continue incrementally from there...

---

**Status**: ✅ Architecture Planning Complete
**Ready for**: Step 2 - Backend Initial Setup

