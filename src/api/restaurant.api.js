import api from './api';

const restaurantApi = {
    search: (q, limit = 5) => api.get('/restaurant/search', {
        params: { q, limit }
    })
};

export default restaurantApi;
