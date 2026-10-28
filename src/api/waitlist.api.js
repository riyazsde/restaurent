import api from './api';

export const waitlistApi = {
    getAll: (params) => api.get('/restaurant/waitlist/getall', { params }),
    getById: (id) => api.get(`/restaurant/waitlist/getbyid/${id}`),
    notify: (id, data) => api.post(`/restaurant/waitlist/notify/${id}`, data)
};
