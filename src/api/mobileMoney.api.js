import api from './api';

export const mobileMoneyApi = {
  // Start MoMo request (POST /payments/mobile-money/request)
  requestPayment: (data) => api.post('/payments/mobile-money/request', data),

  // Record webhook confirmation (Server-to-server; kept for reference/testing)
  recordWebhook: (merchantId, provider, data) =>
    api.post(`/payments/mobile-money/confirmation/${merchantId}/${provider}`, data),

  // Read transactions for polling (GET /payments/transactions/merchant/:merchantId)
  getTransactionsByMerchant: (merchantId, params = { page: 1, limit: 10 }) =>
    api.get(`/payments/transactions/merchant/${merchantId}`, { params })
};

export default mobileMoneyApi;
