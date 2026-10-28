import api from '../api/api';
import { API_ENDPOINTS } from '../utils/constants';

class WebsiteService {
  // Public Key Features
  async getPublicFeatures() {
    try {
      const response = await api.get(API_ENDPOINTS.WEBSITE_KEY_FEATURES_PUBLIC);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Public Website Statistics
  async getPublicStatistics() {
    try {
      const response = await api.get(API_ENDPOINTS.WEBSITE_STATISTICS_PUBLIC);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin Features CRUD
  async getAllFeatures(params = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.WEBSITE_KEY_FEATURES_GET_ALL, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getFeatureById(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.WEBSITE_KEY_FEATURES_GET_BY_ID}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createFeature(data) {
    try {
      const response = await api.post(API_ENDPOINTS.WEBSITE_KEY_FEATURES_CREATE, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateFeature(id, data) {
    try {
      const response = await api.put(`${API_ENDPOINTS.WEBSITE_KEY_FEATURES_UPDATE}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteFeature(id) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.WEBSITE_KEY_FEATURES_DELETE}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin Statistics CRUD
  async getAllStatistics(params = { Status: 'all' }) {
    try {
      const response = await api.get(API_ENDPOINTS.WEBSITE_STATISTICS_GET_ALL, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createStatistic(data) {
    try {
      const response = await api.post(API_ENDPOINTS.WEBSITE_STATISTICS_CREATE, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateStatistic(id, data) {
    try {
      const response = await api.put(`${API_ENDPOINTS.WEBSITE_STATISTICS_UPDATE}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteStatistic(id) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.WEBSITE_STATISTICS_DELETE}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Standard Error handler
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

export default new WebsiteService();
