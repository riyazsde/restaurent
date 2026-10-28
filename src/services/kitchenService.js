import api from '../api/api';

class KitchenService {
  // Get kitchen by auth
  async getKitchenByAuth() {
    try {
      const response = await api.get('/restaurant/Kitchen/getbyauth');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get kitchen by ID
  async getKitchenById(id) {
    try {
      const response = await api.get(`/restaurant/kitchen/get/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create kitchen station
  async createKitchen(kitchenData) {
    try {
      const response = await api.post('/restaurant/kitchen/create', kitchenData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update kitchen station
  async updateKitchen(kitchenData) {
    try {
      const response = await api.put('/restaurant/kitchen/update', kitchenData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete kitchen station
  async deleteKitchen(id) {
    try {
      const response = await api.delete(`/restaurant/kitchen/delete/${id}`);
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

export default new KitchenService();
