import api from './api';

export const servicesApi = {
  create: (data) => api.post('/payments/services/create', data),
  list: (params) => api.get('/payments/services', { params }),
  get: (id) => api.get(`/payments/services/${id}`),
  update: (id, data) => api.put(`/payments/services/${id}`, data),
  complete: (id, data) => api.post(`/payments/services/${id}/complete`, data),
  recordPartialPayment: (id, data) => api.post(`/payments/services/${id}/partial-payment`, data),
  delete: (id) => api.delete(`/payments/services/${id}`)
};
