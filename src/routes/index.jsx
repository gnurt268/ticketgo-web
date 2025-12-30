import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import PrivateRoute from './PrivateRoute';
import { ROLES } from '@/utils/constants';

// Pages
import { HomePage, EventListPage, EventDetailPage } from '@/features/events';
import { CheckoutPage, PaymentSuccessPage, PaymentFailedPage } from '@/features/orders';
import { MyTicketsPage } from '@/features/tickets';

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
            <MyTicketsPage />
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
            <CheckoutPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'payment/success',
        element: (
          <PrivateRoute>
            <PaymentSuccessPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'payment/failed',
        element: (
          <PrivateRoute>
            <PaymentFailedPage />
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