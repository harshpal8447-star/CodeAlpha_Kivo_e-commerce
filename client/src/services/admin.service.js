import api from './api.js';

export const adminService = {
  getMetrics: async () => {
    const res = await api.get('/admin/metrics');
    return res.data;
  },

  getProducts: async () => {
    const res = await api.get('/admin/products');
    return res.data?.products || [];
  },

  createProduct: async (productData) => {
    const res = await api.post('/admin/products', productData);
    return res.data?.product;
  },

  updateProduct: async (id, productData) => {
    const res = await api.put(`/admin/products/${id}`, productData);
    return res.data?.product;
  },

  deleteProduct: async (id) => {
    return api.delete(`/admin/products/${id}`);
  },

  getOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/admin/orders?${query}`);
    return res.data;
  },

  updateOrderStatus: async (id, status) => {
    const res = await api.patch(`/admin/orders/${id}/status`, { status });
    return res.data?.order;
  },
};
