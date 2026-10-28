import api from '../api/api';
import { API_ENDPOINTS } from '../utils/constants';

class TaxSetupService {
  // Get tax setup by auth
  async getTaxSetupByAuth() {
    try {
      const response = await api.get(API_ENDPOINTS.TAX_SETUP_GET_BY_AUTH);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get tax setup by ID
  async getTaxSetupById(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.TAX_SETUP_GET_BY_ID}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create tax setup
  async createTaxSetup(taxData) {
    try {
      const response = await api.post(API_ENDPOINTS.TAX_SETUP_CREATE, taxData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update tax setup
  async updateTaxSetup(taxData) {
    try {
      const response = await api.put(API_ENDPOINTS.TAX_SETUP_UPDATE, taxData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete tax setup
  async deleteTaxSetup(id) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.TAX_SETUP_DELETE}/${id}`);
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

export default new TaxSetupService();
