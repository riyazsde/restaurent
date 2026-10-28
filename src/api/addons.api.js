import api from './api';

export const addonsApi = {
  create: (data) => api.post('/payments/addons/create', data),
  list: (params) => api.get('/payments/addons', { params }),
  get: (id) => api.get(`/payments/addons/${id}`),
  update: (id, data) => api.put(`/payments/addons/${id}`, data),
  delete: (id) => api.delete(`/payments/addons/${id}`)
};
