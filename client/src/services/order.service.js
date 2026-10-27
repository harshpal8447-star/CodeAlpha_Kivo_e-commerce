import api from './api.js';

export const orderService = {
  createOrder: async (orderPayload) => {
    const res = await api.post('/orders', orderPayload);
    return res.data?.order || res.data;
  },

  getMyOrders: async (page = 1, limit = 20) => {
    const res = await api.get(`/orders/my-orders?page=${page}&limit=${limit}`);
    return res.data?.orders || (Array.isArray(res.data) ? res.data : []);
  },

  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data?.order || res.data;
  },
};

export default orderService;
