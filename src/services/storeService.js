import api from '../api/api';
import { API_ENDPOINTS } from '../utils/constants';

class StoreService {
  // Get store details by auth
  async getStoreByAuth() {
    try {
      const response = await api.get(API_ENDPOINTS.STORE_GET_BY_AUTH);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Save or Update store details (POST /restaurant/store_details/save per Postman collection)
  async saveStore(storeData) {
    try {
      const response = await api.post('/restaurant/store_details/save', storeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update store details (supports both /save and /update)
  async updateStore(storeData) {
    try {
      // First attempt the Postman canonical POST /restaurant/store_details/save
      const response = await api.post(API_ENDPOINTS.STORE_SAVE || '/restaurant/store_details/save', storeData);
      return response.data;
    } catch (error) {
      // Fallback to PUT /restaurant/store_details/update if backend requires PUT
      try {
        const fallback = await api.put(API_ENDPOINTS.STORE_UPDATE || '/restaurant/store_details/update', storeData);
        return fallback.data;
      } catch (fallbackError) {
        throw this.handleError(error);
      }
    }
  }

  // Get restaurant purchased subscription
  async getSubscriptionPurchased() {
    try {
      const response = await api.get(API_ENDPOINTS.SUBSCRIPTION_GET_PURCHASED);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get restaurant service charge (GET /api/v1/restaurant/store_details/service-charge)
  async getServiceCharge() {
    try {
      const response = await api.get('/restaurant/store_details/service-charge');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update restaurant service charge (PUT /api/v1/restaurant/store_details/service-charge)
  async updateServiceCharge(serviceChargePercent) {
    try {
      const response = await api.put('/restaurant/store_details/service-charge', {
        service_charge_percent: Number(serviceChargePercent)
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Renew restaurant subscription
  async renewSubscription(payload = {}) {
    try {
      const idempotencyKey = `plan-renewal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const response = await api.post(
        API_ENDPOINTS.SUBSCRIPTION_RENEW,
        payload,
        {
          headers: {
            'Idempotency-Key': idempotencyKey
          }
        }
      );
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

export default new StoreService();
