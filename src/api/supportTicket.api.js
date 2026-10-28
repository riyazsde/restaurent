import api from './api';

export const supportTicketApi = {
    getCategories: () => api.get('/restaurant/support_ticket_type/getall'),
    create: (data) => api.post('/restaurant/support_ticket/create', data),
    getByAuth: () => api.get('/restaurant/support_ticket/getbyauth'),
    getById: (id) => api.get(`/restaurant/support_ticket/getbyid/${id}`),
    getReplies: (params) => api.get('/restaurant/support_ticket_reply/getall', { params }),
    createReply: (data) => api.post('/restaurant/support_ticket_reply/create', data)
};
