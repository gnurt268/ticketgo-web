import { axiosInstance } from '@/api';

/**
 * Storage key cho visitor token (dùng để reconnect)
 */
const getVisitorTokenKey = (eventId) => `queue_token_${eventId}`;

const waitingRoomAPI = {
  // ==================== PUBLIC APIs ====================

  /**
   * GET /api/waiting-room/event/{eventId}
   * Lấy thông tin waiting room theo event ID
   */
  getByEventId: (eventId) => {
    return axiosInstance.get(`/waiting-room/event/${eventId}`);
  },

  /**
   * GET /api/waiting-room/slug/{slug}
   * Lấy thông tin waiting room theo event slug
   */
  getBySlug: (slug) => {
    return axiosInstance.get(`/waiting-room/slug/${slug}`);
  },

  // ==================== USER APIs (Authenticated) ====================

  /**
   * POST /api/waiting-room/event/{eventId}/join
   * Join vào waiting room queue
   * Hỗ trợ reconnect bằng visitorToken đã lưu
   * 
   * @param {number} eventId - ID của event
   * @param {object} options - { fingerprint?: string }
   */
  joinQueue: async (eventId, options = {}) => {
    // Lấy visitorToken đã lưu (nếu có) để reconnect
    const savedToken = localStorage.getItem(getVisitorTokenKey(eventId));
    
    const payload = {
      visitorToken: savedToken || null,
      fingerprint: options.fingerprint || null,
      captchaToken: options.captchaToken || null,
    };

    const response = await axiosInstance.post(
      `/waiting-room/event/${eventId}/join`,
      payload
    );

    // Lưu visitorToken mới vào localStorage
    if (response.data?.visitorToken) {
      localStorage.setItem(
        getVisitorTokenKey(eventId), 
        response.data.visitorToken
      );
    }

    return response;
  },

  /**
   * GET /api/waiting-room/event/{eventId}/status
   * Lấy trạng thái hiện tại của user trong queue
   */
  getQueueStatus: (eventId) => {
    return axiosInstance.get(`/waiting-room/event/${eventId}/status`);
  },

  /**
   * POST /api/waiting-room/event/{eventId}/enter
   * Xác nhận vào protected zone (khi đến lượt)
   * 
   * @param {number} eventId - ID của event
   * @param {string} accessToken - Token được cấp khi đến lượt
   */
  enterProtectedZone: (eventId, accessToken) => {
    return axiosInstance.post(`/waiting-room/event/${eventId}/enter`, {
      accessToken,
    });
  },

  /**
   * POST /api/waiting-room/event/{eventId}/leave
   * Rời khỏi queue
   */
  leaveQueue: (eventId) => {
    // Xóa visitorToken đã lưu
    localStorage.removeItem(getVisitorTokenKey(eventId));
    
    return axiosInstance.post(`/waiting-room/event/${eventId}/leave`);
  },

  // ==================== ADMIN/ORGANIZER APIs ====================

  /**
   * POST /api/waiting-room
   * Tạo waiting room cho event (chỉ ORGANIZER/ADMIN)
   * 
   * @param {object} data - CreateWaitingRoomRequest
   */
  create: (data) => {
    return axiosInstance.post('/waiting-room', data);
  },

  /**
   * PATCH /api/waiting-room/{id}/toggle
   * Bật/tắt waiting room
   * 
   * @param {number} id - ID của waiting room
   * @param {boolean} enabled - Trạng thái mới
   */
  toggle: (id, enabled) => {
    return axiosInstance.patch(`/waiting-room/${id}/toggle`, null, {
      params: { enabled },
    });
  },

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Lấy visitorToken đã lưu (nếu có)
   */
  getSavedVisitorToken: (eventId) => {
    return localStorage.getItem(getVisitorTokenKey(eventId));
  },

  /**
   * Xóa visitorToken đã lưu
   */
  clearVisitorToken: (eventId) => {
    localStorage.removeItem(getVisitorTokenKey(eventId));
  },

  /**
   * Kiểm tra có visitorToken đã lưu không
   */
  hasVisitorToken: (eventId) => {
    return !!localStorage.getItem(getVisitorTokenKey(eventId));
  },
};

export default waitingRoomAPI;