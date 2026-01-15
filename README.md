# CineVault - MERN Stack Movie Application

A full-stack movie management application built with the MERN stack (MongoDB, Express.js, React, Node.js). CineVault provides a premium movie browsing experience with features like watchlists, recently viewed movies, trailer viewing, and comprehensive admin controls.

![CineVault](https://img.shields.io/badge/CineVault-MERN%20Stack-red?style=for-the-badge)

## 🎬 Features

### User Features
- **Movie Browsing**: Browse movies with pagination, search, and sorting
- **Movie Details**: View comprehensive movie information including ratings, duration, and descriptions
- **Watchlist**: Save movies to your personal watchlist
- **Recently Viewed**: Automatically track movies you've viewed
- **Trailer Viewing**: Watch movie trailers directly in the app via YouTube embeds
- **Streaming Links**: Quick access to where movies are available for streaming
- **User Authentication**: Secure signup and login with JWT authentication
- **Responsive Design**: Fully responsive UI that works on all devices

### Admin Features
- **Movie Management**: Add, edit, and delete movies
- **Bulk Movie Upload**: Upload multiple movies at once via JSON file or manual entry
- **User Management**: Create, update, and delete admin users
- **Queue System**: Asynchronous processing for bulk movie uploads
- **Admin Dashboard**: Comprehensive dashboard for managing the application

## 🚀 Live Application

**Live URL**: https://cine-vault-nu.vercel.app/

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/PriyankaDhuri2501/cineVault.git
cd cineVault
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create a .env file in the backend directory
touch .env
```

# Admin Credentials (Optional - defaults provided)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123
```

**Create the default admin user:**

```bash
# From the backend directory
npm run create-admin
```

This will create an admin user with the following **default credentials**:
- **Username**: `admin`
- **Email**: `admin@gmail.com`
- **Password**: `admin123`

> ⚠️ **Important**: Change the admin password after first login for security!

**Start the backend server:**

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Movie Endpoints

#### Get All Movies
```http
GET /api/movies?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

#### Get Movie by ID
```http
GET /api/movies/:id
```

#### Search Movies
```http
GET /api/movies/search?q=inception&page=1&limit=10
```

**Query Parameters:**
- `q` (required): Search query
- `page` (optional): Page number
- `limit` (optional): Items per page

#### Get Sorted Movies
```http
GET /api/movies/sorted?sortBy=rating&order=desc&page=1&limit=10
```

**Query Parameters:**
- `sortBy` (optional): Field to sort by (`title`, `rating`, `releaseDate`, `duration`) - default: `createdAt`
- `order` (optional): Sort order (`asc` or `desc`) - default: `desc`
- `page` (optional): Page number
- `limit` (optional): Items per page

```


#### Get Queue Status (Admin Only)
```http
GET /api/movies/queue/status
Authorization: Bearer <admin_token>
```

#### Update Movie (Admin Only)
```http
PUT /api/movies/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "rating": 9.5
}
```

#### Delete Movie (Admin Only)
```http
DELETE /api/movies/:id
Authorization: Bearer <admin_token>
```

### Admin Endpoints

All admin endpoints require authentication and admin role.

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

#### Create Admin User
```http
POST /api/admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "newadmin",
  "email": "newadmin@gmail.com",
  "password": "securepassword123",
  "role": "admin"
}
```

#### Update User
```http
PUT /api/admin/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "updatedusername",
  "role": "admin"
}
```

#### Delete User
```http
DELETE /api/admin/users/:id
Authorization: Bearer <admin_token>
```

## 🔐 Default Admin Credentials

After running the `npm run create-admin` script, you can login with:

- **Username**: `admin`
- **Email**: `admin@gmail.com`
- **Password**: `admin123`

> ⚠️ **Security Note**: These are default credentials for initial setup. Please change the password immediately after first login in a production environment.


## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds (12)
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Server-side validation using express-validator
- **CORS Configuration**: Configured for specific frontend URL
- **Response Sanitization**: Sensitive data removed from API responses
- **Role-Based Access Control**: Admin and user role separation

## 🎨 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation
- **Express Rate Limit** - Rate limiting

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Material-UI (MUI)** - Component library
- **Axios** - HTTP client
- **Vite** - Build tool

## 📝 Bulk Movie Upload

**Required Fields:**
- `title` (string)
- `description` (string)
- `releaseDate` (ISO 8601 date string: YYYY-MM-DD)
- `duration` (number, in minutes)
- `rating` (number, 0-10)

**Optional Fields:**
- `poster` (string, URL)
- `trailerId` (string, 11-character YouTube video ID)
- `streamingLinks` (array of objects with `platform` and `url`)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👤 Author

[Priyanka Dhuri]

## 🙏 Acknowledgments

- Material-UI for the component library
- MongoDB for the database
- All the open-source contributors

---
