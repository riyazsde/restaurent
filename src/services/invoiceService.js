import api from '../api/api';
import { API_ENDPOINTS } from '../utils/constants';

class InvoiceService {
  // Get invoices by auth
  async getInvoicesByAuth() {
    try {
      const response = await api.get(API_ENDPOINTS.INVOICES_GET_BY_AUTH);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all invoices (GET /api/v1/restaurant/invoices/getall)
  async getAllInvoices() {
    try {
      const response = await api.get('/restaurant/invoices/getall');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get invoice by id
  async getInvoiceById(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.INVOICES_GET_BY_ID}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generate POS Invoice (POST /api/v1/restaurant/invoices/generate-pos-invoice or /generate/:POS_Order_id)
  async generatePosInvoice(orderId) {
    try {
      const numericId = isNaN(Number(orderId)) ? orderId : Number(orderId);
      try {
        const response = await api.post('/restaurant/invoices/generate-pos-invoice', {
          POS_Order_id: numericId
        });
        return response.data;
      } catch (err1) {
        const fallback = await api.post(`/restaurant/invoices/generate/${numericId}`);
        return fallback.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Export invoices to CSV (GET /api/v1/restaurant/invoices/export)
  async exportInvoices() {
    try {
      const response = await api.get('/restaurant/invoices/export', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update invoice (PUT /api/v1/restaurant/invoices/update)
  async updateInvoice(data) {
    try {
      const response = await api.put('/restaurant/invoices/update', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete invoice (DELETE /api/v1/restaurant/invoices/delete/:id)
  async deleteInvoice(id) {
    try {
      const response = await api.delete(`/restaurant/invoices/delete/${id}`);
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

export default new InvoiceService();
