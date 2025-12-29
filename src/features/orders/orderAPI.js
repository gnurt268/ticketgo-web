import { axiosInstance } from '@/api';

const orderAPI = {
  // Create new order
  createOrder: (data) => axiosInstance.post('/orders', data),

  // Get user's orders
  getMyOrders: (params = {}) => axiosInstance.get('/orders', { params }),

  // Get order by ID
  getOrderById: (id) => axiosInstance.get(`/orders/${id}`),

  // Get order by code
  getOrderByCode: (orderCode) => axiosInstance.get(`/orders/code/${orderCode}`),

  // Cancel order
  cancelOrder: (id) => axiosInstance.post(`/orders/${id}/cancel`),

  // Get payment status
  getPaymentStatus: (orderCode) => axiosInstance.get(`/payment/status/${orderCode}`),

  // Retry payment
  retryPayment: (orderCode) => axiosInstance.post(`/payment/retry/${orderCode}`),
};

export default orderAPI;