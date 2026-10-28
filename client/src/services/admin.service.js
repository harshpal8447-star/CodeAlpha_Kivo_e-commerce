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
    const cleanParams = {};
    Object.keys(params).forEach((k) => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '' && params[k] !== 'undefined') {
        cleanParams[k] = params[k];
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    const res = await api.get(`/admin/orders?${query}`);
    return res.data || res;
  },

  updateOrderStatus: async (id, status) => {
    const res = await api.patch(`/admin/orders/${id}/status`, { status });
    return res.data?.order;
  },

  getSellers: async () => {
    const res = await api.get('/admin/sellers');
    return res.data?.sellers || [];
  },

  updateSellerStatus: async (id, isSellerApproved) => {
    const res = await api.patch(`/admin/sellers/${id}/status`, { isSellerApproved });
    return res.data?.seller;
  },
};
