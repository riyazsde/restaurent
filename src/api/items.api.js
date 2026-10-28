import api from './api';

export const itemsApi = {
    listAll: (params) => api.get('/admin/items/list', { params }),
    search: (params) => api.get('/admin/items/search', { params }),
    getVariant: (params) => api.get('/restaurant/item_variants/getbyauth', { params }),
    getAddons: (params) => api.get('/restaurant/item_addons/getbyauth', { params }),
    getFoodCategory: () => api.get('/admin/items_types/getbyauth')
};
