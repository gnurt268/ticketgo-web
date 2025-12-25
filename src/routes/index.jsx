import { createBrowserRouter } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@/components/layout';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import { ROUTES, ROLES } from '@/utils/constants';

// Lazy load pages
import { HomePage } from '@/features/events';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'events',
        element: <HomePage />, // Placeholder
      },
      {
        path: 'events/:id',
        element: <HomePage />, // Placeholder
      },
      {
        path: 'my-tickets',
        element: (
          <PrivateRoute>
            <HomePage /> {/* Placeholder */}
          </PrivateRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <PrivateRoute>
            <HomePage /> {/* Placeholder */}
          </PrivateRoute>
        ),
      },
      // Organizer routes
      {
        path: 'organizer',
        element: (
          <PrivateRoute roles={[ROLES.ORGANIZER, ROLES.ADMIN]}>
            <HomePage /> {/* Placeholder */}
          </PrivateRoute>
        ),
      },
      // Admin routes
      {
        path: 'admin',
        element: (
          <PrivateRoute roles={[ROLES.ADMIN]}>
            <HomePage /> {/* Placeholder */}
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <PublicRoute restricted>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicRoute restricted>
            <RegisterPage />
          </PublicRoute>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <PublicRoute restricted>
            <HomePage /> {/* Placeholder */}
          </PublicRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <HomePage />, // 404 Placeholder
  },
]);

export default router;
