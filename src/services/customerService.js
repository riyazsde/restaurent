import api from '../api/api';
import { API_ENDPOINTS } from '../utils/constants';

class CustomerService {
  // Get all customers
  async getAllCustomers() {
    try {
      const response = await api.get(API_ENDPOINTS.CUSTOMERS_GET_ALL);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  } async getAllCustomerByAuth() {
    try {
      const response = await api.get(API_ENDPOINTS.CUSTOMERS_GET_ALL_BY_AUTH);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get customer by ID
  async getCustomerById(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.CUSTOMERS_GET_BY_ID}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create new customer
  async createCustomer(customerData) {
    try {
      const payload = {
        ...customerData,
        ...(customerData?.phone ? { phone: String(customerData.phone).trim().replace(/[\s\-()]/g, '') } : {})
      };
      const response = await api.post(API_ENDPOINTS.CUSTOMERS_CREATE, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update customer
  async updateCustomer(customerData) {
    try {
      const payload = {
        ...customerData,
        ...(customerData?.phone ? { phone: String(customerData.phone).trim().replace(/[\s\-()]/g, '') } : {})
      };
      const response = await api.put(API_ENDPOINTS.CUSTOMERS_UPDATE, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete customer
  async deleteCustomer(id) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.CUSTOMERS_DELETE}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search customers
  async searchCustomers(searchQuery) {
    try {
      const response = await api.get(`${API_ENDPOINTS.CUSTOMERS_SEARCH}?query=${searchQuery}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      const data = error.response.data;
      const validationErrors = Array.isArray(data?.errors)
        ? data.errors.map((e) => e.msg || e.message).filter(Boolean).join(', ')
        : '';
      return {
        message: validationErrors || data?.message || 'An error occurred',
        status: error.response.status,
        data
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

export default new CustomerService();
