# Task Management Frontend

A modern React frontend for the Task Management Application built with TypeScript, Vite, and TanStack ecosystem. Features a responsive UI with Shadcn/ui components, comprehensive testing, and real-time task management.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Backend server running on port 3000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on http://localhost:3001 and automatically proxy API requests to the backend.

## 🛠 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Testing
npm test             # Run tests in watch mode
npm run test:run     # Run tests once (CI mode)
npm run test:ui      # Run tests with UI
```

### Tech Stack

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

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # Shadcn/ui components
│   │   └── ErrorBoundary.tsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom hooks
│   │   └── use-mobile.ts
│   ├── lib/                # Utility libraries
│   │   ├── api.ts          # API client
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── utils.ts         # General utilities
│   │   └── validations.ts   # Form validations
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Tasks.tsx
│   ├── routes.tsx          # Route configuration
│   ├── test/               # Test files
│   │   ├── mocks.ts        # Mock data
│   │   ├── setup.ts        # Test setup
│   │   ├── test-utils.tsx  # Test utilities
│   │   ├── task-creation-flow.test.tsx
│   │   ├── task-dashboard-integration.test.tsx
│   │   └── dashboard-refresh.test.tsx
│   └── types/              # TypeScript type definitions
│       ├── api.ts
│       ├── auth.ts
│       ├── task.ts
│       └── user.ts
├── public/                 # Static assets
├── dist/                   # Build output
└── package.json
```

## 🎨 UI Components

The application uses Shadcn/ui components with Tailwind CSS for styling:

- **Button** - Interactive buttons with variants
- **Card** - Content containers
- **Dialog** - Modal dialogs
- **Form** - Form components with validation
- **Input** - Text input fields
- **Label** - Form labels
- **Select** - Dropdown selections
- **Separator** - Visual dividers
- **Tabs** - Tabbed interfaces
- **Toast** - Notification system
- **Tooltip** - Hover information

## 🔐 Authentication

The frontend integrates with the backend's JWT authentication system:

- **Login/Register** - User authentication forms
- **Token Management** - Automatic token storage and refresh
- **Protected Routes** - Route-level authentication
- **Context Provider** - Global authentication state

### Authentication Flow

1. User submits login/register form
2. API call to backend authentication endpoint
3. JWT tokens stored in localStorage
4. User redirected to dashboard
5. Protected routes check authentication status

## 📊 Task Management

### Features

- **Create Tasks** - Add new tasks with title, description, and priority
- **View Tasks** - Paginated task list with filtering
- **Update Tasks** - Edit task details and mark as completed
- **Delete Tasks** - Remove tasks with confirmation
- **Task Statistics** - Dashboard with completion rates and analytics
- **Real-time Updates** - Automatic data refresh and caching

### Task Form

```typescript
interface TaskForm {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
}
```

### Task Display

- **Status Indicators** - Visual status badges
- **Priority Levels** - Color-coded priority indicators
- **Creation Dates** - Formatted timestamps
- **Responsive Design** - Mobile-friendly layout

## 🧪 Testing

### Test Structure

The frontend includes comprehensive test coverage:

- **Unit Tests** - Component testing with React Testing Library
- **Integration Tests** - End-to-end user flows
- **Mocking** - API and authentication mocking
- **Test Utilities** - Custom render functions and helpers

### Running Tests

```bash
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

### Test Coverage

- ✅ Task creation form validation
- ✅ API integration and error handling
- ✅ Dashboard task display
- ✅ Navigation between pages
- ✅ User interaction flows
- ✅ Loading states and error boundaries
- ✅ Authentication flow
- ✅ Real-time data updates

## 🔧 Configuration

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

### Environment Variables

The frontend uses these environment variables:

- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

## 🚀 Production Build

### Build Process

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Build Output

- **Optimized Bundle** - Minified and tree-shaken
- **Asset Optimization** - Compressed images and fonts
- **Code Splitting** - Automatic route-based splitting
- **TypeScript Compilation** - Type checking and compilation

## 📱 Responsive Design

The application is fully responsive with:

- **Mobile First** - Optimized for mobile devices
- **Breakpoints** - Tailwind CSS responsive utilities
- **Touch Friendly** - Appropriate touch targets
- **Progressive Enhancement** - Works without JavaScript

## 🔍 Performance

### Optimizations

- **Code Splitting** - Route-based code splitting
- **Lazy Loading** - Component lazy loading
- **Memoization** - React.memo and useMemo
- **Query Caching** - TanStack Query caching
- **Bundle Analysis** - Build size monitoring

### Performance Features

- **Fast Refresh** - Instant updates during development
- **Hot Module Replacement** - Preserves state during updates
- **Tree Shaking** - Removes unused code
- **Asset Optimization** - Compressed and optimized assets

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure backend server is running on port 3000
   - Check CORS configuration
   - Verify API endpoints

2. **Authentication Issues**
   - Clear localStorage and try again
   - Check JWT token validity
   - Verify authentication endpoints

3. **Build Errors**
   - Run `npm run lint` to check for issues
   - Ensure all dependencies are installed
   - Check TypeScript compilation

### Debug Mode

Enable debug mode by setting `NODE_ENV=development` to see detailed error messages and logging.

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vitest Testing](https://vitest.dev/)

---

**Happy coding! 🚀**