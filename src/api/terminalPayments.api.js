import api from './api';

export const terminalPaymentsApi = {
  // Start idempotent terminal payment attempt (POST /employee/terminal-payments/start)
  start: (data) => api.post('/employee/terminal-payments/start', data),

  // Submit terminal result (POST /employee/terminal-payments/:attemptId/result)
  submitResult: (attemptId, data, config = {}) =>
    api.post(`/employee/terminal-payments/${attemptId}/result`, data, config),

  // Poll attempt status (GET /employee/terminal-payments/:attemptId)
  getStatus: (attemptId) => api.get(`/employee/terminal-payments/${attemptId}`),

  // Record acquirer-confirmed reversal (POST /employee/terminal-payments/:attemptId/reverse)
  recordReversal: (attemptId, data) =>
    api.post(`/employee/terminal-payments/${attemptId}/reverse`, data)
};

export default terminalPaymentsApi;
