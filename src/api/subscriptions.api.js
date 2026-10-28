import api from './api';

export const subscriptionsApi = {
    create: (data) => api.post('/payments/subscriptions/create', data),
    list: (params) => api.get('/payments/subscriptions', { params }),
    getById: (id) => api.get(`/payments/subscriptions/${id}`),
    update: (id, data) => api.put(`/payments/subscriptions/${id}`, data),
    cancel: (id, data) => api.post(`/payments/subscriptions/${id}/cancel`, data),
    renew: (id) => api.post(`/payments/subscriptions/${id}/renew`),
    pause: (id, data) => api.post(`/payments/subscriptions/${id}/pause`, data),
    delete: (id) => api.delete(`/payments/subscriptions/${id}`)
};
