import api from '../api/api';
import { API_ENDPOINTS } from '../utils/constants';

class OrdersService {
  // Get all orders for authenticated user
  async getMyOrders() {
    try {
      const response = await api.get(API_ENDPOINTS.ORDERS_GET_MY_ORDERS);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create new order
  async createOrder(orderData) {
    try {
      const response = await api.post(API_ENDPOINTS.ORDERS_CREATE, orderData);
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

export default new OrdersService();
