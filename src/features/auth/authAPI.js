import { axiosInstance } from '@/api';

const authAPI = {
  login: (credentials) => {
    return axiosInstance.post('/auth/login', credentials);
  },

  register: (userData) => {
    return axiosInstance.post('/auth/register', userData);
  },

  logout: () => {
    return axiosInstance.post('/auth/logout');
  },

  refreshToken: (refreshToken) => {
    return axiosInstance.post('/auth/refresh', { refreshToken });
  },

  forgotPassword: (email) => {
    return axiosInstance.post('/auth/forgot-password', { email });
  },

  resetPassword: (data) => {
    return axiosInstance.post('/auth/reset-password', data);
  },

  verifyEmail: (token) => {
    return axiosInstance.post('/auth/verify-email', { token });
  },

  getCurrentUser: () => {
    return axiosInstance.get('/auth/me');
  },

  updateProfile: (data) => {
    return axiosInstance.put('/auth/profile', data);
  },

  changePassword: (data) => {
    return axiosInstance.put('/auth/change-password', data);
  },
};

export default authAPI;
