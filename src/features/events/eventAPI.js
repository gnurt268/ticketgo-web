import { axiosInstance } from '@/api';

const eventAPI = {
  // GET /api/events - Lấy danh sách events với filter
  getEvents: (params = {}) => {
    return axiosInstance.get('/events', { params });
  },

  // GET /api/events/search?q=keyword
  searchEvents: (keyword, params = {}) => {
    return axiosInstance.get('/events/search', { 
      params: { q: keyword, ...params } 
    });
  },

  // GET /api/events/featured
  getFeaturedEvents: (params = {}) => {
    return axiosInstance.get('/events/featured', { params });
  },

  // GET /api/events/top-selling
  getTopSellingEvents: (params = {}) => {
    return axiosInstance.get('/events/top-selling', { params });
  },

  // GET /api/events/most-viewed
  getMostViewedEvents: (params = {}) => {
    return axiosInstance.get('/events/most-viewed', { params });
  },

  // GET /api/events/category/{categoryId}
  getEventsByCategory: (categoryId, params = {}) => {
    return axiosInstance.get(`/events/category/${categoryId}`, { params });
  },

  // GET /api/events/city/{city}
  getEventsByCity: (city, params = {}) => {
    return axiosInstance.get(`/events/city/${encodeURIComponent(city)}`, { params });
  },

  // GET /api/events/cities
  getAvailableCities: () => {
    return axiosInstance.get('/events/cities');
  },

  // GET /api/events/{id}
  getEventDetail: (id) => {
    return axiosInstance.get(`/events/${id}`);
  },

  // GET /api/events/slug/{slug}
  getEventDetailBySlug: (slug) => {
    return axiosInstance.get(`/events/slug/${slug}`);
  },

  // GET /api/events/{id}/related
  getRelatedEvents: (id, limit = 4) => {
    return axiosInstance.get(`/events/${id}/related`, { params: { limit } });
  },
};

export default eventAPI;