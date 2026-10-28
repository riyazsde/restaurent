import api from '../api/api';

class VariantsService {
  // Get all item variants
  async getAllVariants() {
    try {
      const response = await api.get('/restaurant/item_variants/getbyauth');
      return response.data;
    } catch (error) {
      try {
        const fallbackResponse = await api.get('/restaurant/item_variants/getall');
        return fallbackResponse.data;
      } catch {
        throw this.handleError(error);
      }
    }
  }

  // Create item variant
  async createVariant(variantData) {
    try {
      const response = await api.post('/restaurant/item_variants/create', variantData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update item variant
  async updateVariant(variantData) {
    try {
      const response = await api.put('/restaurant/item_variants/update', variantData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Map variant to item
  async mapVariantToItem(mapData) {
    try {
      const response = await api.post('/restaurant/item_map_variants/create', mapData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete variant
  async deleteVariant(id) {
    try {
      const response = await api.delete(`/restaurant/item_variants/delete/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete variant mapping
  async deleteVariantMapping(id) {
    try {
      const response = await api.delete(`/restaurant/item_map_variants/delete/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get mapped variants by item ID
  async getMappedVariantsByItemId(itemId) {
    try {
      const response = await api.get(`/restaurant/item_map_variants/getbyitemid/${itemId}`);
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

export default new VariantsService();
