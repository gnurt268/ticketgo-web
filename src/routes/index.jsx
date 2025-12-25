import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import PrivateRoute from './PrivateRoute';
import { ROLES } from '@/utils/constants';

// Pages
import { HomePage } from '@/features/events';

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
            <HomePage />
          </PrivateRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        ),
      },
      {
        path: 'organizer/*',
        element: (
          <PrivateRoute roles={[ROLES.ORGANIZER, ROLES.ADMIN]}>
            <HomePage />
          </PrivateRoute>
        ),
      },
      {
        path: 'admin/*',
        element: (
          <PrivateRoute roles={[ROLES.ADMIN]}>
            <HomePage />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <MainLayout />,
    children: [
      {
        path: '*',
        element: <HomePage />, // 404 Placeholder
      },
    ],
  },
]);

export default router;