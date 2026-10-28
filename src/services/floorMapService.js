import api from '../api/api';
import { API_ENDPOINTS } from '../utils/constants';

class FloorMapService {
    // Get all floor maps
    async getAllFloorMaps() {
        try {
            const response = await api.get(API_ENDPOINTS.FLOOR_MAP_GET_ALL);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get table by floor ID
    async getTableByFloorId(floorId) {
        try {
            const response = await api.get(`${API_ENDPOINTS.FLOOR_MAP_GET_BY_FLOOR_ID}/${floorId}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Create floor map
    async createFloorMap(mapData) {
        try {
            const response = await api.post(API_ENDPOINTS.FLOOR_MAP_CREATE, mapData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Update floor map
    async updateFloorMap(mapData) {
        try {
            const response = await api.put(API_ENDPOINTS.FLOOR_MAP_UPDATE, mapData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Delete floor map
    async deleteFloorMap(id) {
        try {
            const response = await api.delete(`${API_ENDPOINTS.FLOOR_MAP_DELETE}/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Error handler
    handleError(error) {
        if (error.response) {
            return {
                message: error.response.data?.message || 'An error occurred',
                status: error.response.status,
                data: error.response.data
            };
        } else if (error.request) {
            return {
                message: 'No response from server. Please check your connection.',
                status: 0
            };
        } else {
            return {
                message: error.message || 'An unexpected error occurred',
                status: 0
            };
        }
    }
}

export default new FloorMapService();
