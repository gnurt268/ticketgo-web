import axiosInstance from '../../api/axiosInstance';

const checkinAPI = {
  // POST /api/checkin/validate - Validate QR without check-in
  validateQR: (qrContent) => {
    return axiosInstance.post('/checkin/validate', { qrContent });
  },

  // POST /api/checkin/scan - Check-in by QR
  scan: (qrContent) => {
    return axiosInstance.post('/checkin/scan', { qrContent });
  },

  // GET /api/checkin/stats/{eventId} - Get stats
  getEventStats: (eventId) => {
    return axiosInstance.get(`/checkin/stats/${eventId}`);
  },
};

export default checkinAPI;