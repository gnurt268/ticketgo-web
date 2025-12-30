import { axiosInstance } from '@/api';

const ticketAPI = {
  // Get user's tickets with pagination
  getMyTickets: (params = {}) => axiosInstance.get('/tickets', { params }),

  // Get upcoming tickets
  getUpcomingTickets: () => axiosInstance.get('/tickets/upcoming'),

  // Get past tickets
  getPastTickets: () => axiosInstance.get('/tickets/past'),

  // Get ticket detail by ID
  getTicketById: (id) => axiosInstance.get(`/tickets/${id}`),

  // Get ticket by code
  getTicketByCode: (ticketCode) => axiosInstance.get(`/tickets/code/${ticketCode}`),

  // Get tickets by order
  getTicketsByOrder: (orderId) => axiosInstance.get(`/tickets/order/${orderId}`),

  // Get user's tickets for specific event
  getMyTicketsForEvent: (eventId) => axiosInstance.get(`/tickets/event/${eventId}`),

  // Transfer ticket to another person
  transferTicket: (id, data) => axiosInstance.post(`/tickets/${id}/transfer`, data),

  // Download QR code image
  downloadQRCode: (id) =>
    axiosInstance.get(`/tickets/${id}/qrcode`, {
      responseType: 'blob',
    }),
};

export default ticketAPI;