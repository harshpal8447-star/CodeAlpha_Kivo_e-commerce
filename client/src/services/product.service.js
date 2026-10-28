import api from './api.js';

export const productService = {
  getProducts: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await api.get(`/products?${query.toString()}`);
    const products = res.data?.products || res.products || [];
    const pagination = res.data?.pagination || res.pagination || { total: products.length, page: 1, totalPages: 1 };
    return {
      products,
      pagination,
      data: { products, pagination },
    };
  },

  getFeaturedProducts: async () => {
    const res = await api.get('/products/featured');
    return res.data?.products || [];
  },

  getProduct: async (identifier) => {
    const res = await api.get(`/products/${identifier}`);
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data?.categories || [];
  },

  submitReview: async (productId, reviewData) => {
    const res = await api.post(`/products/${productId}/reviews`, reviewData);
    return res.data?.review;
  },
};
