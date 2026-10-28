import api from '../api/api';
import { API_ENDPOINTS } from '../utils/constants';

class FloorService {
  // Get floors by auth
  async getFloorsByAuth() {
    try {
      const response = await api.get(API_ENDPOINTS.FLOOR_GET_BY_AUTH);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create floor
  async createFloor(floorData) {
    try {
      const response = await api.post(API_ENDPOINTS.FLOOR_CREATE, floorData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update floor
  async updateFloor(floorData) {
    try {
      const response = await api.put(API_ENDPOINTS.FLOOR_UPDATE, floorData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get floor by ID
  async getFloorById(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.FLOOR_GET_BY_ID}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get floor with tables (GET /admin/floor/getWithTables/:floorId)
  async getFloorWithTables(floorId) {
    try {
      const response = await api.get(`${API_ENDPOINTS.FLOOR_GET_WITH_TABLES}/${floorId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete floor
  async deleteFloor(id) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.FLOOR_DELETE}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get mapped tables
  async getMappedTables() {
    try {
      const response = await api.get(API_ENDPOINTS.FLOOR_MAP_GET_ALL);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get waitlist entries (GET /restaurant/waitlist/getall?status=Waiting)
  async getWaitlist(status = 'Waiting') {
    try {
      const params = status ? { status } : {};
      const response = await api.get(API_ENDPOINTS.WAITLIST_GET_ALL, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get waitlist entry by ID (GET /restaurant/waitlist/getbyid/:id)
  async getWaitlistById(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.WAITLIST_GET_BY_ID}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Notify waitlist user (POST /restaurant/waitlist/notify/:id)
  async notifyWaitlistUser(id, payload = { channel: 'SMS', delivery_reference: `MSG-${Date.now()}` }) {
    try {
      const response = await api.post(`${API_ENDPOINTS.WAITLIST_NOTIFY}/${id}`, payload);
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

export default new FloorService();
