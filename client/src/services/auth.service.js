import api from './api.js';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.token) {
      localStorage.setItem('kivo_token', res.data.token);
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.token) {
      localStorage.setItem('kivo_token', res.data.token);
    }
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('kivo_token');
    }
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data?.user;
  },

  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  updateProfile: async (data) => {
    const res = await api.put('/users/profile', data);
    return res.data?.user;
  },

  getAddresses: async () => {
    const res = await api.get('/users/addresses');
    return res.data?.addresses || [];
  },

  addAddress: async (addressData) => {
    const res = await api.post('/users/addresses', addressData);
    return res.data?.address;
  },

  updateAddress: async (id, addressData) => {
    const res = await api.put(`/users/addresses/${id}`, addressData);
    return res.data?.address;
  },

  deleteAddress: async (id) => {
    return api.delete(`/users/addresses/${id}`);
  },
};
