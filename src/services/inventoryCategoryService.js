import api from '../api/api';

class InventoryCategoryService {
    // --- RESTAURANT INVENTORY CATEGORIES ---
    
    async getAllRestaurantCategories() {
        try {
            const response = await api.get('/restaurant/inventory-category/getall');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async getRestaurantCategoryById(id) {
        try {
            const response = await api.get(`/restaurant/inventory-category/get/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async createRestaurantCategory(data) {
        try {
            const response = await api.post('/restaurant/inventory-category/create', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async updateRestaurantCategory(data) {
        try {
            // First attempt PUT as specified in Postman
            const response = await api.put('/restaurant/inventory-category/update', data);
            return response.data;
        } catch (error) {
            // Fallback to POST for backward-compatibility
            try {
                const fallback = await api.post('/restaurant/inventory-category/update', data);
                return fallback.data;
            } catch (fallbackError) {
                throw error.response?.data || error;
            }
        }
    }

    async deleteRestaurantCategory(id) {
        try {
            const response = await api.delete(`/restaurant/inventory-category/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }


    // --- BAR INVENTORY CATEGORIES ---

    async getAllBarCategories() {
        try {
            const response = await api.get('/restaurant/bar-inventory-category/getall');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async getBarCategoryById(id) {
        try {
            const response = await api.get(`/restaurant/bar-inventory-category/get/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async createBarCategory(data) {
        try {
            const response = await api.post('/restaurant/bar-inventory-category/create', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async updateBarCategory(data) {
        try {
            // First attempt PUT as specified in Postman
            const response = await api.put('/restaurant/bar-inventory-category/update', data);
            return response.data;
        } catch (error) {
            try {
                const fallback = await api.post('/restaurant/bar-inventory-category/update', data);
                return fallback.data;
            } catch (fallbackError) {
                throw error.response?.data || error;
            }
        }
    }

    async deleteBarCategory(id) {
        try {
            const response = await api.delete(`/restaurant/bar-inventory-category/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
}

export default new InventoryCategoryService();
