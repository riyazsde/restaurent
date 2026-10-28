import api from '../api/api';
import { API_ENDPOINTS } from '../utils/constants';

class TableService {
  // Get all tables
  async getAllTables() {
    try {
      const response = await api.get(API_ENDPOINTS.TABLES_GET_ALL);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get tables by auth
  async getTablesByAuth() {
    try {
      const response = await api.get(API_ENDPOINTS.TABLES_GET_BY_AUTH);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get table by ID
  async getTableById(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.TABLES_GET_BY_ID}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create table
  async createTable(tableData) {
    try {
      const response = await api.post(API_ENDPOINTS.TABLES_CREATE, tableData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update table
  async updateTable(tableData) {
    try {
      const response = await api.put(API_ENDPOINTS.TABLES_UPDATE, tableData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete table
  async deleteTable(id) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.TABLES_DELETE}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get table QR code data
  async getTableQrData(id) {
    try {
      const response = await api.get(`/admin/table/qr-data/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Scan table QR code / code string
  async scanTable(tableCode) {
    try {
      const response = await api.get(`/admin/table/scan/${tableCode}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all table booking statuses
  async getAllTableBookingStatuses() {
    try {
      const response = await api.get(API_ENDPOINTS.TABLE_BOOKING_STATUS_GET_ALL);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all table types
  async getAllTableTypes() {
    try {
      const response = await api.get(API_ENDPOINTS.TABLE_TYPES_GET_ALL);
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

export default new TableService();
