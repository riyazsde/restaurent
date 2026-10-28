import api from '../api/api';

class HealthService {
  /**
   * Check backend health status (GET /api/v1/health or /health)
   * @returns {Promise<Object>} health status
   */
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (err) {
      try {
        const response = await api.get('/api/v1/health');
        return response.data;
      } catch (fallbackErr) {
        throw (err || fallbackErr);
      }
    }
  }
}

export default new HealthService();
