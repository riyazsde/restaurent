import api from './api';

export const chatApi = {
    getConversations: (params) => api.get('/restaurant/chat/conversations/getall', { params }),
    getConversationById: (id) => api.get(`/restaurant/chat/conversations/getbyid/${id}`)
};
