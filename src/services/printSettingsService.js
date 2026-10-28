import api from '../api/api';
import { API_ENDPOINTS } from '../utils/constants';

class PrintSettingsService {
  // Get print settings by auth
  async getPrintSettingsByAuth() {
    try {
      const response = await api.get(API_ENDPOINTS.PRINT_SETTINGS_GET_BY_AUTH);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Save print settings (POST /restaurant/print_settings/save per Postman collection)
  async savePrintSettings(settingsData) {
    try {
      const response = await api.post('/restaurant/print_settings/save', settingsData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update print settings (supports both /save and /update)
  async updatePrintSettings(settingsData) {
    try {
      // First attempt Postman canonical POST /restaurant/print_settings/save
      const response = await api.post('/restaurant/print_settings/save', settingsData);
      return response.data;
    } catch (error) {
      try {
        const fallback = await api.put('/restaurant/print_settings/update', settingsData);
        return fallback.data;
      } catch (fallbackError) {
        throw this.handleError(error);
      }
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

export default new PrintSettingsService();
