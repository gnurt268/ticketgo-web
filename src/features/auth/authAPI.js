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
    return axiosInstance.get('/auth/verify-email', { params: { token } });
  },

  resendVerification: (email) => {
    return axiosInstance.post('/auth/resend-verification', { email });
  },

  getCurrentUser: () => {
    return axiosInstance.get('/auth/me');
  },
};

export default authAPI;
