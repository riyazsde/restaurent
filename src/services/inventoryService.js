import api from '../api/api';

class InventoryService {
    // --- RESTAURANT INVENTORY ---
    
    async getRestaurantInventory() {
        try {
            const response = await api.get('/restaurant/inventory/getbyauth');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async getRestaurantInventoryById(id) {
        try {
            const response = await api.get(`/restaurant/inventory/get/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async getAllRestaurantInventory() {
        try {
            const response = await api.get('/restaurant/inventory/getall');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async createRestaurantInventory(data) {
        try {
            const response = await api.post('/restaurant/inventory/create', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async updateRestaurantInventory(data) {
        try {
            // Support both numeric inventory_id and MongoDB id/_id per audit spec
            const payload = { ...data };
            if (data.inventory_id !== undefined && payload.id === undefined) {
                payload.id = data.inventory_id;
            } else if (data.id !== undefined && payload.inventory_id === undefined && !isNaN(Number(data.id))) {
                payload.inventory_id = Number(data.id);
            }

            // First attempt PUT per Postman collection and audit guide
            const response = await api.put('/restaurant/inventory/update', payload);
            return response.data;
        } catch (error) {
            try {
                const fallback = await api.post('/restaurant/inventory/update', data);
                return fallback.data;
            } catch (fallbackError) {
                throw error.response?.data || error;
            }
        }
    }

    async deleteRestaurantInventory(id) {
        try {
            const response = await api.delete(`/restaurant/inventory/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // --- BAR INVENTORY ---

    async getBarInventory() {
        try {
            const response = await api.get('/restaurant/bar-inventory/getbyauth');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async getBarInventoryById(id) {
        try {
            const response = await api.get(`/restaurant/bar-inventory/get/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async searchBarInventory(query) {
        try {
            // Audit guide: GET /restaurant/bar-inventory/search?search=beer or ?query=beer
            const encoded = encodeURIComponent(query || '');
            const response = await api.get(`/restaurant/bar-inventory/search?search=${encoded}&query=${encoded}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async filterBarInventory(status) {
        try {
            const response = await api.get(`/restaurant/bar-inventory/filter?status=${status}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async createBarInventory(data) {
        try {
            const response = await api.post('/restaurant/bar-inventory/create', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async updateBarInventory(data) {
        try {
            // First attempt PUT per Postman collection
            const response = await api.put('/restaurant/bar-inventory/update', data);
            return response.data;
        } catch (error) {
            try {
                const fallback = await api.post('/restaurant/bar-inventory/update', data);
                return fallback.data;
            } catch (fallbackError) {
                throw error.response?.data || error;
            }
        }
    }

    async deleteBarInventory(id) {
        try {
            const response = await api.delete(`/restaurant/bar-inventory/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async getBarInventoryStatistics() {
        try {
            const response = await api.get('/restaurant/bar-inventory/statistics');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    async adjustBarStock(id, data) {
        try {
            const response = await api.post(`/restaurant/bar-inventory/adjust-stock/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
}

export default new InventoryService();
