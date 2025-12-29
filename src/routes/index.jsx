import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import PrivateRoute from './PrivateRoute';
import { ROLES } from '@/utils/constants';

// Pages
import { HomePage, EventListPage, EventDetailPage } from '@/features/events';

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
        element: <EventListPage />,
      },
      {
        path: 'events/:id',
        element: <EventDetailPage />,
      },
      {
        path: 'my-tickets',
        element: (
          <PrivateRoute>
            <HomePage /> {/* TODO: MyTicketsPage */}
          </PrivateRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <PrivateRoute>
            <HomePage /> {/* TODO: ProfilePage */}
          </PrivateRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <PrivateRoute>
            <HomePage /> {/* TODO: CheckoutPage */}
          </PrivateRoute>
        ),
      },
      {
        path: 'organizer/*',
        element: (
          <PrivateRoute roles={[ROLES.ORGANIZER, ROLES.ADMIN]}>
            <HomePage /> {/* TODO: OrganizerPages */}
          </PrivateRoute>
        ),
      },
      {
        path: 'admin/*',
        element: (
          <PrivateRoute roles={[ROLES.ADMIN]}>
            <HomePage /> {/* TODO: AdminPages */}
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