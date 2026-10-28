import api from '../api/api';

class ItemsService {
  // Get all items (defaults to status=all to include active and hidden items)
  async getAllItems(params = {}) {
    try {
      const statusParam = params?.status || 'all';
      const response = await api.get(`/admin/items/getbyauth?status=${statusParam}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Global item search (GET /api/v1/admin/items/search?q=<term>&limit=20&type=<Food|Drink>)
  async searchItems(params = {}) {
    try {
      const { q, limit = 20, type } = params;
      const queryParts = [];
      if (q) queryParts.push(`q=${encodeURIComponent(q)}`);
      if (limit) queryParts.push(`limit=${limit}`);
      if (type) queryParts.push(`type=${type}`);
      const response = await api.get(`/admin/items/search?${queryParts.join('&')}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get items list with filters (type, category_id, search, status)
  async getItemsList(params = {}) {
    try {
      const { type, category_id, search, status = 'all' } = params;
      let url = '/admin/items/list?';
      const queryParts = [];
      if (type) queryParts.push(`type=${type}`);
      if (category_id) queryParts.push(`category_id=${category_id}`);
      if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
      if (status) queryParts.push(`status=${status}`);
      
      const response = await api.get(url + queryParts.join('&'));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get item by ID
  async getItemById(id) {
    try {
      const response = await api.get(`/admin/items/get/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create item
  async createItem(itemData) {
    try {
      const response = await api.post('/admin/items/create', itemData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update item
  async updateItem(itemData) {
    try {
      const response = await api.put('/admin/items/update', itemData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete item
  async deleteItem(id) {
    try {
      const response = await api.delete(`/admin/items/delete/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get items by category
  async getItemsByCategory(categoryId) {
    try {
      const response = await api.get(`/admin/items/getbycategory/${categoryId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get items by item type ID
  async getItemsByItemType(itemTypeId) {
    try {
      const response = await api.get(`/admin/items/getbyitemtype/${itemTypeId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get item map variants by item ID
  async getItemMapVariants(itemId) {
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

  // Get item map addons by item ID
  async getItemMapAddons(itemId) {
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

  // Get all variants with prices
  async getAllVariants() {
    try {
      const response = await api.get('/restaurant/item_variants/getall');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all addons with prices
  async getAllAddons() {
    try {
      const response = await api.get('/restaurant/item_addons/getall');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      const data = error.response.data;
      let msg = data?.message || 'An error occurred';
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        const errorDetails = data.errors.map(err => err.msg || err.message || `${err.param}: ${err.msg}` || JSON.stringify(err)).join(', ');
        msg = `${msg}: ${errorDetails}`;
      } else if (data?.errors && typeof data.errors === 'object') {
        msg = `${msg}: ${JSON.stringify(data.errors)}`;
      }
      return {
        message: msg,
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

export default new ItemsService();
