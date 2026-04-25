import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import PrivateRoute from "./PrivateRoute";
import { ROLES } from "@/utils/constants";

// Pages
import { HomePage, EventListPage, EventDetailPage } from "@/features/events";
import {
  CheckoutPage,
  PaymentSuccessPage,
  PaymentFailedPage,
} from "@/features/orders";
import { MyTicketsPage } from "@/features/tickets";
import { ProfilePage } from "@/features/profile";
import { CheckInPage } from "@/features/checkin";
import { WaitingRoomPage } from "@/features/waitingroom";
import { VerifyEmailPage } from "@/features/auth";

// Admin Pages
import AdminLayout from "@/components/admin/AdminLayout";
import {
  AdminDashboardPage,
  UserManagementPage,
  EventManagementPage,
  OrderManagementPage,
  CategoryManagementPage,
  OrganizerRequestManagementPage,
} from "@/features/admin";

// Organizer Pages
import {
  OrganizerLayout,
  OrganizerDashboardPage,
  OrganizerEventListPage,
  OrganizerEventFormPage,
  OrganizerEventDetailPage,
} from "@/features/organizer";

const router = createBrowserRouter([
  // Check-in route (full screen)
  {
    path: "/checkin",
    element: (
      <PrivateRoute roles={[ROLES.STAFF, ROLES.ORGANIZER, ROLES.ADMIN]}>
        <CheckInPage />
      </PrivateRoute>
    ),
  },

  // Email verification route (full screen, public)
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },

  // Admin routes with sidebar layout
  {
    path: "/admin",
    element: (
      <PrivateRoute roles={[ROLES.ADMIN]}>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "users", element: <UserManagementPage /> },
      { path: "events", element: <EventManagementPage /> },
      { path: "events/pending", element: <EventManagementPage /> },
      { path: "events/approved", element: <EventManagementPage /> },
      { path: "events/cancelled", element: <EventManagementPage /> },
      { path: "orders", element: <OrderManagementPage /> },
      { path: "categories", element: <CategoryManagementPage /> },
      {
        path: "organizer-requests",
        element: <OrganizerRequestManagementPage />,
      },
    ],
  },

  // Main layout routes
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "events", element: <EventListPage /> },
      { path: "events/:id", element: <EventDetailPage /> },
      {
        path: "waiting-room/:eventId",
        element: (
          <PrivateRoute>
            <WaitingRoomPage />
          </PrivateRoute>
        ),
      },
      {
        path: "my-tickets",
        element: (
          <PrivateRoute>
            <MyTicketsPage />
          </PrivateRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: "checkout",
        element: (
          <PrivateRoute>
            <CheckoutPage />
          </PrivateRoute>
        ),
      },
      {
        path: "payment/success",
        element: (
          <PrivateRoute>
            <PaymentSuccessPage />
          </PrivateRoute>
        ),
      },
      {
        path: "payment/failed",
        element: (
          <PrivateRoute>
            <PaymentFailedPage />
          </PrivateRoute>
        ),
      },
    ],
  },

  // Organizer routes with sidebar layout
  {
    path: "/organizer",
    element: (
      <PrivateRoute roles={[ROLES.ORGANIZER, ROLES.ADMIN]}>
        <OrganizerLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <OrganizerDashboardPage /> },
      { path: "events", element: <OrganizerEventListPage /> },
      { path: "events/create", element: <OrganizerEventFormPage /> },
      { path: "events/:id", element: <OrganizerEventDetailPage /> },
      { path: "events/:id/edit", element: <OrganizerEventFormPage /> },
    ],
  },

  // 404
  {
    path: "*",
    element: <MainLayout />,
    children: [{ path: "*", element: <HomePage /> }],
  },
]);

export default router;