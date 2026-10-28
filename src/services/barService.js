import serviceFactory from './serviceFactory';

const barTabsApi = serviceFactory.createService('bar-tabs');
const barInventoryApi = serviceFactory.createService('bar-inventory');
const barInventoryCategoryApi = serviceFactory.createService('bar-inventory-category');

class BarService {
  // -------------------------
  // Bar Tabs APIs
  // -------------------------
  async openBarTab(data) {
    try {
      return await barTabsApi.create(data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listBarTabs(status = 'Open') {
    try {
      return await barTabsApi.getAll({ status });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBarTabById(id) {
    try {
      return await barTabsApi.getById(id);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addItemToTab(id, data) {
    try {
      return await barTabsApi.addItemToTab(id, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async payAndCloseTab(id, data) {
    try {
      return await barTabsApi.payAndCloseTab(id, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // -------------------------
  // Bar Inventory APIs
  // -------------------------
  async createInventory(data) {
    try { return await barInventoryApi.create(data); } catch(e) { throw this.handleError(e); }
  }

  async listInventory() {
    try { return await barInventoryApi.getByAuth(); } catch(e) { throw this.handleError(e); }
  }

  async searchInventory(query) {
    try { return await barInventoryApi.search(query); } catch(e) { throw this.handleError(e); }
  }

  async getInventoryById(id) {
    try { return await barInventoryApi.getById(id); } catch(e) { throw this.handleError(e); }
  }

  async updateInventory(id, data) {
    try { return await barInventoryApi.update(id, data); } catch(e) { throw this.handleError(e); }
  }

  async adjustInventoryStock(id, data) {
    try { return await barInventoryApi.adjustStock(id, data); } catch(e) { throw this.handleError(e); }
  }

  async getInventoryStatistics() {
    try { return await barInventoryApi.getStatistics(); } catch(e) { throw this.handleError(e); }
  }

  async filterInventory(status) {
    try { return await barInventoryApi.filter(status); } catch(e) { throw this.handleError(e); }
  }

  async deleteInventory(id) {
    try { return await barInventoryApi.remove(id); } catch(e) { throw this.handleError(e); }
  }

  // -------------------------
  // Bar Inventory Categories APIs
  // -------------------------
  async createCategory(data) {
    try { return await barInventoryCategoryApi.create(data); } catch(e) { throw this.handleError(e); }
  }

  async listCategories() {
    try { return await barInventoryCategoryApi.getAll(); } catch(e) { throw this.handleError(e); }
  }

  async getCategoryById(id) {
    try { return await barInventoryCategoryApi.getById(id); } catch(e) { throw this.handleError(e); }
  }

  async updateCategory(id, data) {
    try { return await barInventoryCategoryApi.update(id, data); } catch(e) { throw this.handleError(e); }
  }

  async deleteCategory(id) {
    try { return await barInventoryCategoryApi.remove(id); } catch(e) { throw this.handleError(e); }
  }

  // Error Handler
  handleError(error) {
    console.error('Bar Service Error:', error);
    if (error.response && error.response.data) {
      return new Error(error.response.data.message || 'An error occurred');
    }
    return new Error('Network error or server is down');
  }
}

export default new BarService();
