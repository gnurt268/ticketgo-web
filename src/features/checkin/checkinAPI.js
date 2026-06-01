import axiosInstance from '../../api/axiosInstance';

const checkinAPI = {
  // GET /api/checkin/events - sự kiện current-user được phép check-in
  getMyEvents: () => {
    return axiosInstance.get('/checkin/events');
  },

  // GET /api/checkin/events/{eventId}/stats
  getEventStats: (eventId) => {
    return axiosInstance.get(`/checkin/events/${eventId}/stats`);
  },

  // POST /api/checkin/events/{eventId}/validate - preview vé (không ghi nhận)
  validateQR: (eventId, qrContent) => {
    return axiosInstance.post(`/checkin/events/${eventId}/validate`, { qrContent });
  },

  // POST /api/checkin/events/{eventId}/scan - check-in vé
  scan: (eventId, qrContent) => {
    return axiosInstance.post(`/checkin/events/${eventId}/scan`, { qrContent });
  },
};

export default checkinAPI;
