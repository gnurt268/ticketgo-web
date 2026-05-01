import { axiosInstance } from '@/api';

const profileAPI = {
  getMyProfile: () => {
    return axiosInstance.get('/users/profile');
  },

  updateProfile: (data) => {
    return axiosInstance.put('/users/profile', data);
  },

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  changePassword: (data) => {
    return axiosInstance.put('/users/change-password', data);
  },

  // ===== Organizer Request =====
  submitOrganizerRequest: (data) => {
    return axiosInstance.post('/organizer-requests', data);
  },

  getMyOrganizerRequest: () => {
    return axiosInstance.get('/organizer-requests/my');
  },

  cancelMyOrganizerRequest: () => {
    return axiosInstance.delete('/organizer-requests/my');
  },
};

export default profileAPI;
