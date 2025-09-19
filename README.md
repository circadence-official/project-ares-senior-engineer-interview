# Task Management Application

A full-stack task management application built with React, Node.js, and pg-mem database. Features JWT authentication, task CRUD operations, and a modern responsive UI.

Claude Code agents were created from prompts in this Youtube video:   https://www.youtube.com/watch?v=TxsNTqaTrKw

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Clone and Install Dependencies

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

### 2. Start the Backend Server

```bash
# Start the backend server (runs on port 3000)
npm start

# Or for development with auto-restart
npm run dev
```

The backend will:
- Initialize the pg-mem in-memory database
- Create users and tasks tables
- Start the Express server on http://localhost:3000
- Enable CORS for the frontend

### 3. Start the Frontend Server

```bash
# Navigate to frontend directory
cd frontend

# Start the frontend development server (runs on port 3001)
npm run dev

# Or build for production
npm run build
```

The frontend will:
- Start the Vite development server on http://localhost:3001
- Automatically proxy API requests to the backend
- Enable hot module replacement for development

### 4. Complete Startup Process

For development, you'll need two terminals:

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

Open your browser and navigate to:
- **Frontend Application**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 📊 Database Setup

The application uses pg-mem (in-memory PostgreSQL) which automatically:
- Creates the database schema on startup
- Initializes users and tasks tables
- Sets up indexes for better performance
- **Note**: Data is lost when the server restarts (by design for development)

### Database Management Commands

```bash
# Initialize database manually
npm run db:init

# Check database setup
npm run db:check

# Test authentication middleware
npm run auth:test
```

### Database Schema

**Users Table:**
- `id` (Primary Key)
- `email` (Unique)
- `password` (Hashed with bcrypt)
- `created_at` (Timestamp)

**Tasks Table:**
- `id` (Primary Key)
- `title` (Required)
- `description` (Optional)
- `status` (pending/completed)
- `priority` (low/medium/high)
- `user_id` (Foreign Key)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## 👤 Creating Your First User



### Method 1: Using the API Directly

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'

# Login to get a JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

### Method 2: Using the Test Script

```bash
# Run the comprehensive test script
./test-application.sh
```

This will:
- Test all API endpoints
- Create a test user
- Create sample tasks
- Verify the application is working correctly

## 🎯 Using the Application

### Authentication
- **Protected Routes**: Dashboard and tasks require authentication

### Task Management
- **Create Tasks**: Add new tasks with title, description, and priority
- **View Tasks**: See all your tasks with pagination
- **Update Tasks**: Edit task details or mark as completed
- **Delete Tasks**: Remove tasks you no longer need
- **Statistics**: View task completion rates and priority breakdown



## 🛠 Development

### Backend Development
```bash
# Start with auto-restart
npm run dev

# Run tests
npm test

# Run integration tests
npm run test:integration

# Check test coverage
npm run test:coverage
```



### Environment Configuration

The backend uses these environment variables:
- `JWT_SECRET`: Secret key for JWT tokens (required)
- `JWT_EXPIRES_IN`: Token expiration time (default: 24h)
- `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: Allowed frontend origin (default: *)
- `NODE_ENV`: Environment mode (development/production/test)
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window (default: 15 minutes)
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window (default: 100)
- `FRONTEND_URL`: Frontend URL for CORS (optional)

The frontend uses Vite configuration:
- Development server runs on port 3001
- API requests are proxied to backend on port 3000
- Hot module replacement enabled for development

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Tasks (Protected)
- `GET /api/tasks` - Get user's tasks (with pagination)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats` - Get task statistics

### System
- `GET /health` - Health check
- `GET /` - API information

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testNamePattern="auth"
npm test -- --testNamePattern="tasks"

# Run unit tests only (with mocks)
npm run test:unit
npm run test:unit:watch
npm run test:unit:coverage

# Run integration tests only (real code)
npm run test:integration
npm run test:integration:watch
npm run test:integration:coverage

# Run all tests (unit + integration)
npm run test:all
npm run test:all:coverage

# Run with coverage
npm run test:coverage

# Database management
npm run db:init      # Initialize database
npm run db:check     # Check database setup
npm run auth:test    # Test auth middleware
```

### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run specific test files
npx vitest run src/test/task-dashboard-integration.test.tsx
npx vitest run src/test/task-creation-flow.test.tsx
npx vitest run src/test/dashboard-refresh.test.tsx
```

### Integration Tests
```bash
# Run full-stack integration tests
npm run test:integration
```

## 🚀 Production Deployment

### Backend Deployment
1. Set production environment variables
2. Replace pg-mem with real PostgreSQL database
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use PM2 or similar process manager



## 📁 Project Structure

```
project-ares-senior-engineer-coding-interview/
├── server.js                 # Main server file
├── package.json              # Backend dependencies
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
│   └── errors.js            # Error handling
├── tests/                    # Backend tests
└── docs/                     # Documentation
```

## 🔧 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill processes using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm start
```

**CORS Issues:**
- Ensure `CORS_ORIGIN` is set to `http://localhost:3001` (or `*` for development)
- Check that both servers are running on correct ports (Backend: 3000, Frontend: 3001)

**Database Issues:**
- pg-mem data is lost on restart (this is normal)
- Check server logs for database initialization messages



### Getting Help

1. Check the server logs for error messages
2. Verify both frontend and backend are running
3. Test API endpoints directly with curl
4. Check browser console for frontend errors
5. Run the test script: `./test-application.sh`

## 📝 License

This project is part of a coding interview assessment.

---

**Happy coding! 🚀**