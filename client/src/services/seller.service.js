import api from './api.js';

export const sellerService = {
  getProfile: async () => {
    const res = await api.get('/seller/profile');
    return res.data?.seller;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/seller/profile', profileData);
    return res.data?.seller;
  },

  getMetrics: async () => {
    const res = await api.get('/seller/metrics');
    return res.data;
  },

  getProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/seller/products?${query}`);
    return res.data;
  },

  createProduct: async (productData) => {
    const res = await api.post('/seller/products', productData);
    return res.data?.product;
  },

  updateProduct: async (id, productData) => {
    const res = await api.put(`/seller/products/${id}`, productData);
    return res.data?.product;
  },

  deleteProduct: async (id) => {
    return api.delete(`/seller/products/${id}`);
  },

  getOrders: async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((k) => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '' && params[k] !== 'undefined') {
        cleanParams[k] = params[k];
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    const res = await api.get(`/seller/orders?${query}`);
    return res.data || res;
  },

  updateOrderItemStatus: async (itemId, status) => {
    const res = await api.put(`/seller/orders/items/${itemId}/status`, { status });
    return res.data?.item;
  },
};

export default sellerService;
