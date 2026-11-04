import api from '../api/api';
import { API_ENDPOINTS } from '../utils/constants';
import { normalizeDiningOption } from '../utils/diningOption';

class PosService {
  // Create POS order
  async createPosOrder(orderData) {
    try {
      const payload = {
        ...orderData,
        Dining_Option: normalizeDiningOption(orderData?.Dining_Option)
      };
      const response = await api.post(API_ENDPOINTS.POS_ORDER_CREATE, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get my orders (for kitchen & orders: GET /api/v1/restaurant/pos_order/my-orders)
  async getMyOrders(params = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.ORDERS_GET_MY_ORDERS, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all orders for Kitchen Display (GET /api/v1/restaurant/pos_order/getall?filter=today)
  async getKitchenDisplayOrders(filter = 'today') {
    try {
      const response = await api.get(API_ENDPOINTS.POS_ORDER_GET_ALL, {
        params: { filter }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all orders with optional filter or Order_Status (e.g. Order_Status=In_Kitchen)
  async getAllOrders(params = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.POS_ORDER_GET_ALL, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send order items to kitchen (PATCH /api/v1/restaurant/pos_order/send-to-kitchen)
  async sendToKitchen(payload) {
    try {
      const orderId = payload?.id ?? payload?.POS_Order_id;
      const body = {
        ...payload,
        id: isNaN(Number(orderId)) ? orderId : Number(orderId)
      };
      const response = await api.patch(API_ENDPOINTS.POS_ORDER_SEND_TO_KITCHEN, body);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update item status (PATCH /api/v1/restaurant/pos_order/update-item-status)
  async updateItemStatus(updateData) {
    try {
      const orderId = updateData?.id ?? updateData?.POS_Order_id;
      const payload = {
        ...updateData,
        id: isNaN(Number(orderId)) ? orderId : Number(orderId),
        item_id: isNaN(Number(updateData?.item_id)) ? updateData?.item_id : Number(updateData?.item_id)
      };
      const response = await api.patch(API_ENDPOINTS.POS_ORDER_UPDATE_ITEM_STATUS, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get available order statuses (GET /api/v1/restaurant/pos_order/statuses)
  async getOrderStatuses() {
    try {
      const response = await api.get('/restaurant/pos_order/statuses');
      return response.data;
    } catch (error) {
      // Fallback default statuses if route not deployed yet
      return {
        success: true,
        data: ['Preparing', 'In_Kitchen', 'Cooking', 'Ready', 'Served', 'Cancelled', 'Completed']
      };
    }
  }

  // Update order status (PATCH or PUT /api/v1/restaurant/pos_order/update-status)
  async updateOrderStatus(updateData) {
    try {
      const orderId = updateData?.POS_Order_id ?? updateData?.id ?? updateData?.order_id ?? updateData?.Order_id;
      if (!orderId) {
        console.error('POS order ID is required to update order status:', updateData);
        throw new Error('POS order ID is required');
      }
      let statusVal = updateData?.status ?? updateData?.Order_Status;
      // Backend validates enum: ['Preparing', 'In_Kitchen', 'Cooking', 'Ready', 'Served', 'Cancelled', 'Completed']
      // Map 'Accepted' to 'Preparing' to prevent 400 validation error
      if (statusVal === 'Accepted' || !statusVal) {
        statusVal = 'Preparing';
      }

      const numericId = isNaN(Number(orderId)) ? orderId : Number(orderId);
      const payload = {
        ...updateData,
        id: numericId,
        POS_Order_id: numericId,
        Order_Status: statusVal,
        status: statusVal
      };

      try {
        // Attempt PATCH per postman.json endpoint specification
        const response = await api.patch(API_ENDPOINTS.POS_ORDER_UPDATE_STATUS, payload);
        return response.data;
      } catch (patchErr) {
        // Fallback to PUT if server requires PUT
        const response = await api.put(API_ENDPOINTS.POS_ORDER_UPDATE_STATUS, payload);
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Accept QR Order via status update (PATCH /api/v1/restaurant/pos_order/update-status)
  async acceptQrOrder(qrOrderId) {
    try {
      const numericId = typeof qrOrderId === 'object' && qrOrderId !== null
        ? (qrOrderId.POS_Order_id ?? qrOrderId.id ?? qrOrderId.order_id ?? qrOrderId.QR_Order_id)
        : qrOrderId;
      return await this.updateOrderStatus({ id: numericId, Order_Status: 'Preparing' });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reject QR Order via status update (PATCH /api/v1/restaurant/pos_order/update-status)
  async rejectQrOrder(qrOrderId) {
    try {
      const numericId = typeof qrOrderId === 'object' && qrOrderId !== null
        ? (qrOrderId.POS_Order_id ?? qrOrderId.id ?? qrOrderId.order_id ?? qrOrderId.QR_Order_id)
        : qrOrderId;
      return await this.updateOrderStatus({ id: numericId, Order_Status: 'Cancelled' });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generate Store Menu QR (GET /api/v1/restaurant/store_menu/generate-qr)
  async generateStoreMenuQr() {
    try {
      const response = await api.get(API_ENDPOINTS.STORE_MENU_GENERATE_QR || '/restaurant/store_menu/generate-qr');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get table QR code data (GET /api/v1/admin/table/qr-data/:tableId)
  async getTableQrData(tableId) {
    try {
      const response = await api.get(`/admin/table/qr-data/${tableId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Scan table QR code (GET /api/v1/admin/table/scan/:tableCode)
  async scanTableQr(tableCode) {
    try {
      const response = await api.get(`/admin/table/scan/${tableCode}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Export orders to CSV (GET /api/v1/restaurant/pos_order/export)
  async exportOrders(params = {}) {
    try {
      const response = await api.get('/restaurant/pos_order/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete item from order (DELETE /api/v1/restaurant/pos_order/delete-item/:orderId/:itemId)
  async deleteOrderItem(orderId, itemId) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.POS_ORDER_DELETE_ITEM}/${orderId}/${itemId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get order receipt by ID (GET /api/v1/restaurant/pos_order/getbyid/:orderId)
  async getOrderById(orderId) {
    try {
      const response = await api.get(`${API_ENDPOINTS.POS_ORDER_GET_BY_ID}/${orderId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Download order receipt PDF (GET /api/v1/restaurant/pos_order/getbyid/:orderId/pdf)
  async getOrderPdf(orderId) {
    try {
      const response = await api.get(`${API_ENDPOINTS.POS_ORDER_GET_BY_ID}/${orderId}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get current order by table ID
  async getCurrentOrder(tableId) {
    try {
      const response = await api.get(`${API_ENDPOINTS.POS_ORDER_CURRENT_TABLE}/${tableId}/current-order`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update order (e.g., quantity, payment_status, Order_Status)
  async updateOrder(orderData) {
    try {
      const response = await api.put(API_ENDPOINTS.POS_ORDER_UPDATE, orderData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get payment options (GET /api/v1/restaurant/payment_options/auth/my-options)
  async getPaymentOptions() {
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

  // Create payment
  async createPayment(paymentData) {
    try {
      const response = await api.post('/restaurant/payment_by_restaurant/create-payment', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all payments by restaurant
  async getAllPayments() {
    try {
      const response = await api.get('/restaurant/payment_by_restaurant/all-payments');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create walk-in customer (POS)
  async createCustomer(customerData) {
    try {
      const payload = { ...customerData, DOB: customerData?.DOB || null };
      const response = await api.post(API_ENDPOINTS.CUSTOMERS_CREATE, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update customer (POS)
  async updateCustomer(customerData) {
    try {
      const payload = { ...customerData, DOB: customerData?.DOB || null };
      const response = await api.put(API_ENDPOINTS.CUSTOMERS_UPDATE, payload);
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

export default new PosService();
