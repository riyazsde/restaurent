import api from './api';

export const customerApi = {
    getAll: () => api.get('/restaurant/customer/getall'),
    getByAuth: () => api.get('/restaurant/customer/getbyauth'),
    getById: (id) => api.get(`/restaurant/customer/getbyid/${id}`),
    create: (data) => api.post('/restaurant/customer/create', data),
    update: (data) => api.put('/restaurant/customer/update', data),
    delete: (id) => api.delete(`/restaurant/customer/delete/${id}`),
    search: (query) => api.get(`/restaurant/customer/search?query=${query}`)
};

export default customerApi;
