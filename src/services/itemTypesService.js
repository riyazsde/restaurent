import api from '../api/api';

class ItemTypesService {
  // Get all item types
  async getAllItemTypes(type) {
    try {
      const url = type ? `/admin/items_types/getbyauth?type=${type}` : '/admin/items_types/getbyauth';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      try {
        const fallbackUrl = type ? `/admin/items_types/getall?type=${type}` : '/admin/items_types/getall';
        const response = await api.get(fallbackUrl);
        return response.data;
      } catch {
        throw this.handleError(error);
      }
    }
  }

  // Create item type
  async createItemType(itemTypeData) {
    try {
      const response = await api.post('/admin/items_types/create', itemTypeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update item type
  async updateItemType(itemTypeData) {
    try {
      const response = await api.put('/admin/items_types/update', itemTypeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete item type
  async deleteItemType(id) {
    try {
      const response = await api.delete(`/admin/items_types/delete/${id}`);
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

export default new ItemTypesService();
