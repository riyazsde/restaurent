import api from '../api/api';

class MenuService {
  // Get all menu map items
  async getAllMenuMapItems() {
    try {
      const response = await api.get('/restaurant/menu_map_items/getall');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generate store menu QR code
  async generateMenuQr() {
    try {
      const response = await api.get('/restaurant/store_menu/generate-qr');
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

export default new MenuService();
