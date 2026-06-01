// API
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

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

// Payment status (OrderDTO.paymentStatus)
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
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
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

// Organizer request status
export const ORGANIZER_REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
};

// Organization type
export const ORGANIZATION_TYPE = {
  INDIVIDUAL: 'INDIVIDUAL',
  COMPANY: 'COMPANY',
  ORGANIZATION: 'ORGANIZATION',
};

export const ORGANIZATION_TYPE_LABELS = {
  INDIVIDUAL: 'Cá nhân',
  COMPANY: 'Doanh nghiệp',
  ORGANIZATION: 'Tổ chức',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 12;

// Date formats
export const DATE_FORMAT = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DDTHH:mm:ss',
};
