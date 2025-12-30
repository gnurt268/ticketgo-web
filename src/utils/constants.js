// API
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  EVENTS: '/events',
  EVENT_DETAIL: '/events/:id',
  CHECKOUT: '/checkout',
  MY_TICKETS: '/my-tickets',
  PROFILE: '/profile',
  CHECK_IN: '/checkin',
  
  // Organizer
  ORGANIZER_DASHBOARD: '/organizer',
  ORGANIZER_EVENTS: '/organizer/events',
  ORGANIZER_CREATE_EVENT: '/organizer/events/create',
  ORGANIZER_EDIT_EVENT: '/organizer/events/:id/edit',
  
  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_USERS: '/admin/users',
};

// Roles
export const ROLES = {
  USER: 'USER',
  STAFF: 'STAFF',
  ORGANIZER: 'ORGANIZER',
  ADMIN: 'ADMIN',
};

// Order status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
};

// Ticket status
export const TICKET_STATUS = {
  ACTIVE: 'ACTIVE',
  USED: 'USED',
  CANCELLED: 'CANCELLED',
  TRANSFERRED: 'TRANSFERRED',
};

// Event status
export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 12;

// Date formats
export const DATE_FORMAT = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DDTHH:mm:ss',
};