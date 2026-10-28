import api from './api';

export const hardwareSalesApi = {
    create: (data) => api.post('/payments/hardware-sales/create', data),
    list: (params) => api.get('/payments/hardware-sales', { params }),
    getById: (id) => api.get(`/payments/hardware-sales/${id}`),
    update: (id, data) => api.put(`/payments/hardware-sales/${id}`, data),
    delete: (id) => api.delete(`/payments/hardware-sales/${id}`)
};
