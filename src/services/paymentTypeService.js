import api from '../api/api';
import { API_ENDPOINTS } from '../utils/constants';

class PaymentTypeService {
  // Get payment types by auth (payment_type)
  async getPaymentTypesByAuth() {
    try {
      const response = await api.get('/restaurant/payment_type/getbyauth');
      return response.data;
    } catch (error) {
      // Fallback to payment_options if backend uses legacy route
      try {
        const fallback = await api.get('/restaurant/payment_options/auth/my-options');
        return fallback.data;
      } catch (fallbackError) {
        throw this.handleError(error);
      }
    }
  }

  // Get payment options for restaurant POS (GET /api/v1/restaurant/payment_options/auth/my-options)
  async getPaymentOptionsByAuth() {
    try {
      const response = await api.get('/restaurant/payment_options/auth/my-options');
      return response.data;
    } catch (error) {
      try {
        const fallback = await api.get('/restaurant/payment_options/getbyauth');
        return fallback.data;
      } catch (fallbackError) {
        throw this.handleError(error);
      }
    }
  }

  // Start terminal payment (card machine attempt)
  async startTerminalPayment(paymentData) {
    try {
      // Strip any raw PAN, CVV, CVC fields per audit security spec
      const safeData = { ...paymentData };
      delete safeData.cvv;
      delete safeData.cvc;
      delete safeData.cardNumber;
      delete safeData.pan;

      try {
        const response = await api.post('/employee/terminal-payments/start', safeData);
        return response.data;
      } catch (employeeError) {
        const fallback = await api.post('/restaurant/terminal-payment/start', safeData);
        return fallback.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get payment type by ID
  async getPaymentTypeById(id) {
    try {
      const response = await api.get(`/restaurant/payment_type/get/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create payment options (POST /api/v1/restaurant/payment_options/create)
  async createPaymentOption(payload) {
    try {
      const response = await api.post('/restaurant/payment_options/create', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create payment type
  async createPaymentType(paymentData) {
    try {
      const response = await api.post('/restaurant/payment_type/create', paymentData);

      // Auto-sync cashier-visible payment option if PaymentOption array is provided
      if (paymentData.PaymentOption && Array.isArray(paymentData.PaymentOption)) {
        try {
          await api.post('/restaurant/payment_options/create', {
            PaymentOption: paymentData.PaymentOption,
            Status: paymentData.Status !== false
          });
        } catch (syncErr) {
          console.warn('payment_options auto-sync skipped:', syncErr?.message);
        }
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update payment type
  async updatePaymentType(paymentData) {
    try {
      const response = await api.put('/restaurant/payment_type/update', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete payment type
  async deletePaymentType(id) {
    try {
      const response = await api.delete(`/restaurant/payment_type/delete/${id}`);
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

export default new PaymentTypeService();
