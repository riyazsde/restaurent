import api from './api';

export const merchantPaymentConfigApi = {
  list: () => api.get('/payments/merchant-payment-config'),
  createOrUpdate: (provider, data) => api.put(`/payments/merchant-payment-config/${provider}`, data)
};
