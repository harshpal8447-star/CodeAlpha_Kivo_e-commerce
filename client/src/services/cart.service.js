import api from './api.js';

export const cartService = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data?.cart;
  },

  addToCart: async (productId, quantity = 1) => {
    const res = await api.post('/cart/add', { productId, quantity });
    return res.data?.cart;
  },

  updateQuantity: async (itemId, quantity) => {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    return res.data?.cart;
  },

  removeItem: async (itemId) => {
    const res = await api.delete(`/cart/items/${itemId}`);
    return res.data?.cart;
  },

  clearCart: async () => {
    const res = await api.delete('/cart/clear');
    return res.data?.cart;
  },

  syncCart: async (guestItems) => {
    const res = await api.post('/cart/sync', { guestItems });
    return res.data?.cart;
  },
};
