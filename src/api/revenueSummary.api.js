import api from './api';

export const revenueSummaryApi = {
  generate: (data) => api.post('/payments/revenue-summary/generate', data),
  list: (params) => api.get('/payments/revenue-summary', { params }),
  get: (id) => api.get(`/payments/revenue-summary/${id}`),
  delete: (id) => api.delete(`/payments/revenue-summary/${id}`)
};
