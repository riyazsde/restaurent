import api from '../api/api';

class PromotionService {
    async getAll(params = { page: 1, limit: 10, search: '' }) {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.search) queryParams.append('search', params.search);
            if (params.status !== undefined && params.status !== '') {
                queryParams.append('Status', params.status);
            }

            const response = await api.get(`/restaurant/promotions/getall?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async getById(id) {
        try {
            const targetId = typeof id === 'object' ? (id.Promotion_id || id._id || id.id) : id;
            const response = await api.get(`/restaurant/promotions/getbyid/${targetId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async create(data) {
        try {
            const payload = {
                coupon_name: data.coupon_name?.trim(),
                coupon_code: data.coupon_code?.trim(),
                category: data.category?.trim(),
                offer: data.offer?.trim(),
                Status: data.Status !== undefined ? Boolean(data.Status) : true
            };
            const response = await api.post('/restaurant/promotions/create', payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async update(data) {
        try {
            const payload = {
                Promotion_id: data.Promotion_id ?? data.id ?? data._id,
                coupon_name: data.coupon_name?.trim(),
                coupon_code: data.coupon_code?.trim(),
                category: data.category?.trim(),
                offer: data.offer?.trim(),
                Status: data.Status !== undefined ? Boolean(data.Status) : true
            };
            const response = await api.put('/restaurant/promotions/update', payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async toggleStatus(id, status) {
        try {
            const targetId = typeof id === 'object' ? (id.Promotion_id ?? id._id ?? id.id) : id;
            const response = await api.patch(`/restaurant/promotions/status/${targetId}`, { Status: Boolean(status) });
            return response.data;
        } catch (error) {
            try {
                const targetId = typeof id === 'object' ? (id.Promotion_id ?? id._id ?? id.id) : id;
                const fallback = await api.put(`/restaurant/promotions/status/${targetId}`, { Status: Boolean(status) });
                return fallback.data;
            } catch (fallbackError) {
                throw error.response?.data || error;
            }
        }
    }

    async delete(id) {
        try {
            const targetId = typeof id === 'object' ? (id.Promotion_id ?? id._id ?? id.id) : id;
            const response = await api.delete(`/restaurant/promotions/delete/${targetId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
}

export default new PromotionService();
