import api from './api';

export const transactionsApi = {
  record: (data) => api.post('/payments/transactions/record', data),
  listByMerchant: (merchantId, params) => api.get(`/payments/transactions/merchant/${merchantId}`, { params }),
  get: (id) => api.get(`/payments/transactions/${id}`),
  update: (id, data) => api.put(`/payments/transactions/${id}`, data),
  delete: (id) => api.delete(`/payments/transactions/${id}`)
};
