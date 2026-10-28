import api from '../api/api';

class AddonsService {
  // Get all item addons
  async getAllAddons() {
    try {
      const response = await api.get('/restaurant/item_addons/getbyauth');
      return response.data;
    } catch (error) {
      try {
        const fallbackResponse = await api.get('/restaurant/item_addons/getall');
        return fallbackResponse.data;
      } catch {
        throw this.handleError(error);
      }
    }
  }

  // Create item addon
  async createAddon(addonData) {
    try {
      const response = await api.post('/restaurant/item_addons/create', addonData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update item addon
  async updateAddon(addonData) {
    try {
      const response = await api.put('/restaurant/item_addons/update', addonData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Map addon to item
  async mapAddonToItem(mapData) {
    try {
      const response = await api.post('/restaurant/item_map_addons/create', mapData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete addon
  async deleteAddon(id) {
    try {
      const response = await api.delete(`/restaurant/item_addons/delete/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete addon mapping
  async deleteAddonMapping(id) {
    try {
      const response = await api.delete(`/restaurant/item_map_addons/delete/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get mapped addons by item ID
  async getMappedAddonsByItemId(itemId) {
    try {
      const response = await api.get(`/restaurant/item_map_addons/getbyitemid/${itemId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { success: true, data: [] };
      }
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

export default new AddonsService();
