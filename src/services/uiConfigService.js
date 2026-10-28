import api from '../api/api';

class UiConfigService {
  /**
   * Fetch localized UI configuration and store settings
   * GET /api/v1/restaurant/ui-config?locale=${locale}
   * @param {string} locale - e.g. 'fr-FR', 'en-US', 'fr', 'en'
   * @returns {Promise<Object>} ui-config data containing locale, currency, labels, order_statuses, dashboard_filters
   */
  async getUiConfig(locale = 'en-US') {
    try {
      // Normalize locale parameter
      const normalizedLocale = locale.startsWith('fr') ? 'fr-FR' : 'en-US';
      const response = await api.get('/restaurant/ui-config', {
        params: { locale: normalizedLocale }
      });
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

export default new UiConfigService();
