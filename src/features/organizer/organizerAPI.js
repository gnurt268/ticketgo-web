import { axiosInstance } from '@/api';

const organizerAPI = {
  // ===== Events =====
  getMyEvents: (params = {}) =>
    axiosInstance.get('/organizer/events', { params }),

  getStatistics: () => axiosInstance.get('/organizer/events/statistics'),

  getRevenueStatistics: (period = '7d') =>
    axiosInstance.get('/organizer/events/statistics/revenue', {
      params: { period },
    }),

  getEventDetail: (id) => axiosInstance.get(`/organizer/events/${id}`),

  createEvent: (data) => axiosInstance.post('/organizer/events', data),

  updateEvent: (id, data) => axiosInstance.put(`/organizer/events/${id}`, data),

  submitForApproval: (id) =>
    axiosInstance.post(`/organizer/events/${id}/submit`),

  publishEvent: (id) => axiosInstance.post(`/organizer/events/${id}/publish`),

  cancelEvent: (id, reason) =>
    axiosInstance.post(`/organizer/events/${id}/cancel`, null, {
      params: reason ? { reason } : {},
    }),

  // ===== Ticket Zones =====
  getEventZones: (eventId) =>
    axiosInstance.get(`/organizer/events/${eventId}/zones`),

  createZone: (eventId, data) =>
    axiosInstance.post(`/organizer/events/${eventId}/zones`, data),

  updateZone: (id, data) => axiosInstance.put(`/organizer/zones/${id}`, data),

  deleteZone: (id) => axiosInstance.delete(`/organizer/zones/${id}`),

  toggleZoneActive: (id) =>
    axiosInstance.patch(`/organizer/zones/${id}/toggle-active`),

  reorderZones: (eventId, zoneIds) =>
    axiosInstance.put(`/organizer/events/${eventId}/zones/reorder`, zoneIds),

  // ===== Seats =====
  generateSeats: (zoneId, data) =>
    axiosInstance.post(`/organizer/zones/${zoneId}/seats/generate`, data),

  deleteAllSeats: (zoneId) =>
    axiosInstance.delete(`/organizer/zones/${zoneId}/seats`),

  getZoneSeats: (zoneId) => axiosInstance.get(`/zones/${zoneId}/seats`),

  // ===== Tickets =====
  getEventTickets: (eventId, params = {}) =>
    axiosInstance.get(`/tickets/organizer/events/${eventId}`, { params }),

  validateTicket: (ticketCode) =>
    axiosInstance.get(`/tickets/organizer/validate/${ticketCode}`),
};

export default organizerAPI;
