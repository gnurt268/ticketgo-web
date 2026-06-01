import axiosInstance from "@/api/axiosInstance";

// ==================== DASHBOARD ====================
export const getDashboardStatistics = async () => {
  const response = await axiosInstance.get("/admin/dashboard/statistics");
  return response.data;
};

// ==================== USERS ====================
export const getUsers = async (params = {}) => {
  const response = await axiosInstance.get("/admin/users", { params });
  return response.data;
};

export const getUserDetail = async (id) => {
  const response = await axiosInstance.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await axiosInstance.put(`/admin/users/${id}`, data);
  return response.data;
};

export const toggleUserActive = async (id) => {
  const response = await axiosInstance.patch(
    `/admin/users/${id}/toggle-active`
  );
  return response.data;
};

export const changeUserRole = async (id, role) => {
  const response = await axiosInstance.patch(
    `/admin/users/${id}/change-role`,
    null,
    {
      params: { role },
    }
  );
  return response.data;
};

export const verifyUserEmail = async (id) => {
  const response = await axiosInstance.patch(`/admin/users/${id}/verify-email`);
  return response.data;
};

export const deactivateUser = async (id) => {
  const response = await axiosInstance.delete(`/admin/users/${id}/deactivate`);
  return response.data;
};

export const deleteUserPermanently = async (id) => {
  const response = await axiosInstance.delete(`/admin/users/${id}/permanent`);
  return response.data;
};

export const getUserStatistics = async () => {
  const response = await axiosInstance.get("/admin/users/statistics");
  return response.data;
};

// ==================== EVENTS ====================
export const getEvents = async (params = {}) => {
  const response = await axiosInstance.get("/admin/events", { params });
  return response.data;
};

export const getPendingEvents = async (params = {}) => {
  const response = await axiosInstance.get("/admin/events/pending", { params });
  return response.data;
};

export const getEventDetail = async (id) => {
  const response = await axiosInstance.get(`/admin/events/${id}`);
  return response.data;
};

export const approveEvent = async (id, data) => {
  const response = await axiosInstance.post(
    `/admin/events/${id}/approval`,
    data
  );
  return response.data;
};

export const toggleEventFeatured = async (id) => {
  const response = await axiosInstance.patch(
    `/admin/events/${id}/toggle-featured`
  );
  return response.data;
};

export const cancelEvent = async (id, reason) => {
  const response = await axiosInstance.post(
    `/admin/events/${id}/cancel`,
    null,
    {
      params: { reason },
    }
  );
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await axiosInstance.delete(`/admin/events/${id}`);
  return response.data;
};

export const getEventStatistics = async () => {
  const response = await axiosInstance.get("/admin/events/statistics");
  return response.data;
};

// ==================== CATEGORIES ====================
export const getCategories = async () => {
  const response = await axiosInstance.get("/categories");
  return response.data;
};

// ADMIN: gồm cả category đã ẩn (inactive)
export const getAllCategories = async () => {
  const response = await axiosInstance.get("/categories/all");
  return response.data;
};

export const createCategory = async (data) => {
  const response = await axiosInstance.post("/categories", data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await axiosInstance.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await axiosInstance.delete(`/categories/${id}`);
  return response.data;
};

// ==================== ORDERS ====================
export const getOrders = async (params = {}) => {
  const response = await axiosInstance.get("/admin/orders", { params });
  return response.data;
};

export const getOrderDetail = async (id) => {
  const response = await axiosInstance.get(`/admin/orders/${id}`);
  return response.data;
};

export const getOrderStatistics = async () => {
  const response = await axiosInstance.get("/admin/orders/statistics");
  return response.data;
};
