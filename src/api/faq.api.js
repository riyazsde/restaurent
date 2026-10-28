import api from './api';

export const faqApi = {
    getAll: () => api.get('/master/faq/all')
};
