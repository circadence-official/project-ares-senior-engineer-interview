import { createRootRoute, createRoute, createRouter, redirect, Outlet } from '@tanstack/react-router';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TasksPage } from '@/pages/TasksPage';
import { tokenManager } from '@/lib/api';

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Auth guard function
const requireAuth = () => {
  if (!tokenManager.hasToken()) {
    throw redirect({
      to: '/login',
    });
  }
};

// Public routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: () => {
    // Redirect to dashboard if already authenticated
    if (tokenManager.hasToken()) {
      throw redirect({
        to: '/dashboard',
      });
    }
  },
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
  beforeLoad: () => {
    // Redirect to dashboard if already authenticated
    if (tokenManager.hasToken()) {
      throw redirect({
        to: '/dashboard',
      });
    }
  },
});

// Protected layout route
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: requireAuth,
  component: DashboardPage,
});

// Tasks route
const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  beforeLoad: requireAuth,
  component: TasksPage,
});

// Index route - redirect to dashboard or login
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    if (tokenManager.hasToken()) {
      throw redirect({
        to: '/dashboard',
      });
    } else {
      throw redirect({
        to: '/login',
      });
    }
  },
  component: () => null,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  protectedRoute,
  tasksRoute,
]);

// Create router
export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => {
    return <div className="p-8 text-center">Page not found</div>;
  },
});

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}