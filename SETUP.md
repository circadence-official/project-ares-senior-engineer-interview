# Task Management Application Setup

A comprehensive setup guide for the full-stack Task Management Application built with React, Node.js, and pg-mem database.

## Overview

This is a complete task management system featuring:
- **Backend API**: Node.js/Express with JWT authentication
- **Frontend**: React with TypeScript and modern UI components
- **Database**: pg-mem in-memory PostgreSQL for development
- **Testing**: Comprehensive unit and integration tests
- **Authentication**: JWT-based user authentication
- **UI**: Responsive design with Shadcn/ui components

## Prerequisites

- **Node.js**: v16 or higher
- **npm**: v8 or higher
- **Git**: For cloning the repository

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd project-ares-senior-engineer-coding-interview

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Start the Application

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## Detailed Setup

### Backend Setup

#### Environment Configuration

Create a `.env` file in the root directory:

```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*

# Optional Configuration
FRONTEND_URL=http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Database Initialization

The pg-mem database initializes automatically, but you can also:

```bash
# Initialize database manually
npm run db:init

# Check database setup
npm run db:check

# Test authentication middleware
npm run auth:test
```

#### Available Scripts

```bash
# Development
npm start              # Start production server
npm run dev           # Start development server with auto-restart

# Testing
npm test              # Run all tests
npm run test:unit     # Run unit tests only
npm run test:integration  # Run integration tests only
npm run test:all      # Run both unit and integration tests
npm run test:coverage # Run tests with coverage report

# Database
npm run db:init       # Initialize database
npm run db:check      # Check database setup
npm run auth:test     # Test authentication middleware
```

### Frontend Setup

#### Environment Configuration

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Task Management
VITE_APP_VERSION=1.0.0
```

#### Available Scripts

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build

# Testing
npm test              # Run tests in watch mode
npm run test:run       # Run tests once (CI mode)
npm run test:ui       # Run tests with UI

# Code Quality
npm run lint          # Run ESLint
```

## Project Structure

```
project-ares-senior-engineer-coding-interview/
├── server.js                 # Main server file
├── package.json              # Backend dependencies and scripts
├── .env                      # Environment variables
├── routes/                   # API route handlers
│   ├── auth.js              # Authentication routes
│   └── tasks.js             # Task management routes
├── middleware/               # Express middleware
│   ├── auth.js              # JWT authentication
│   └── security.js          # Security middleware
├── models/                   # Database models
│   ├── User.js              # User model
│   └── Task.js              # Task model
├── utils/                    # Utility functions
│   ├── database.js          # Database utilities
│   ├── validation.js        # Input validation
│   ├── errors.js            # Error handling
│   └── initDatabase.js      # Database initialization
├── tests/                    # Backend tests
│   ├── auth.test.js
│   ├── task-crud.test.js
│   ├── security.test.js
│   └── utils/               # Test utilities
├── integration-tests/        # Integration tests
│   ├── auth.integration.test.js
│   ├── tasks.integration.test.js
│   └── middleware.integration.test.js
├── docs/                     # Documentation
│   ├── AUTHENTICATION.md
│   └── DATABASE_SETUP.md
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utility libraries
│   │   ├── types/           # TypeScript types
│   │   ├── test/            # Frontend tests
│   │   └── routes.tsx       # Route configuration
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts      # Vite configuration
└── test-application.sh      # Application test script
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/change-password` - Change password

### Tasks (Protected)
- `GET /api/tasks` - Get user's tasks (with pagination)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats` - Get task statistics

### System
- `GET /health` - Health check
- `GET /` - API information

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

### Backend Testing

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit              # Unit tests with mocks
npm run test:integration       # Integration tests with real database
npm run test:all               # Both unit and integration tests

# Run with coverage
npm run test:coverage
npm run test:unit:coverage
npm run test:integration:coverage
npm run test:all:coverage

# Watch mode
npm run test:unit:watch
npm run test:integration:watch
```

### Frontend Testing

```bash
cd frontend

# Run tests
npm test                       # Watch mode
npm run test:run              # CI mode
npm run test:ui               # UI mode

# Run specific tests
npx vitest run src/test/task-dashboard-integration.test.tsx
npx vitest run src/test/task-creation-flow.test.tsx
npx vitest run src/test/dashboard-refresh.test.tsx
```

### Integration Testing

```bash
# Run full-stack integration tests
npm run test:integration

# Test the complete application
./test-application.sh
```

## Development Workflow

### 1. Start Development Servers

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Create Your First User

```bash
# Using curl
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'

# Or use the test script
./test-application.sh
```

### 3. Access the Application

1. Open http://localhost:3001 in your browser
2. Register a new account or login
3. Start creating and managing tasks
4. View task statistics on the dashboard

## Production Deployment

### Backend Deployment

1. **Environment Setup**:
   ```env
   NODE_ENV=production
   JWT_SECRET=your_production_jwt_secret
   PORT=3000
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

2. **Database Migration**:
   - Replace pg-mem with real PostgreSQL
   - Set up database connection variables
   - Run database migrations

3. **Process Management**:
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name "task-api"
   ```

### Frontend Deployment

1. **Build for Production**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Static Hosting**:
   - Upload `dist/` folder to your hosting service
   - Configure environment variables
   - Set up proper CORS origins

## Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Kill processes using port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Or use different ports
   PORT=3001 npm start
   ```

2. **CORS Issues**:
   - Ensure `CORS_ORIGIN` is set correctly
   - Check that both servers are running on correct ports
   - Verify frontend is making requests to correct backend URL

3. **Database Issues**:
   - pg-mem data is lost on restart (this is normal)
   - Check server logs for database initialization messages
   - Run `npm run db:check` to verify database setup

4. **Authentication Issues**:
   - Clear localStorage and try again
   - Check JWT token validity
   - Verify authentication endpoints are working

### Debug Commands

```bash
# Check backend health
curl http://localhost:3000/health

# Test authentication
npm run auth:test

# Check database setup
npm run db:check

# Run application test script
./test-application.sh
```

### Getting Help

1. Check server logs for error messages
2. Verify both frontend and backend are running
3. Test API endpoints directly with curl
4. Check browser console for frontend errors
5. Run the test script: `./test-application.sh`

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **pg-mem** - In-memory PostgreSQL database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **Jest** - Testing framework
- **Supertest** - HTTP testing

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Router** - File-based routing
- **TanStack Query** - Data fetching and caching
- **TanStack Form** - Form management
- **Shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **Vitest** - Testing framework
- **React Testing Library** - Component testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is part of a coding interview assessment.

---

**Happy coding! 🚀**