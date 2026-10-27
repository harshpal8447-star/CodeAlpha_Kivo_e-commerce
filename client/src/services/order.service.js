import api from './api.js';

export const orderService = {
  createOrder: async (orderPayload) => {
    const res = await api.post('/orders', orderPayload);
    return res.data?.order;
  },

  getMyOrders: async (page = 1, limit = 10) => {
    const res = await api.get(`/orders/my-orders?page=${page}&limit=${limit}`);
    return res.data;
  },

  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data?.order;
  },
};
