import api from '../api/api';

/**
 * Base API Service providing standard CRUD operations.
 */
class BaseApiService {
  constructor(baseRoute) {
    this.baseRoute = baseRoute;
  }

  async get(url, params = {}) {
    const response = await api.get(`${this.baseRoute}${url}`, { params });
    return response.data;
  }

  async post(url, data) {
    const response = await api.post(`${this.baseRoute}${url}`, data);
    return response.data;
  }

  async put(url, data) {
    const response = await api.put(`${this.baseRoute}${url}`, data);
    return response.data;
  }

  async patch(url, data) {
    const response = await api.patch(`${this.baseRoute}${url}`, data);
    return response.data;
  }

  async delete(url) {
    const response = await api.delete(`${this.baseRoute}${url}`);
    return response.data;
  }

  async create(data) {
    return this.post('/create', data);
  }

  async getAll(params = {}) {
    return this.get('/getall', params);
  }

  async getById(id) {
    return this.get(`/getbyid/${id}`);
  }

  async update(idOrData, data) {
    if (typeof idOrData === 'object' && idOrData !== null && !data) {
      return this.put('/update', idOrData);
    }
    return this.put(`/update/${idOrData}`, data);
  }

  async remove(id) {
    return this.delete(`/delete/${id}`);
  }
}

/**
 * Specialized Service Classes
 */
class BarTabsService extends BaseApiService {
  constructor() {
    super('/restaurant/bar-tabs');
  }

  async addItemToTab(id, data) {
    return this.post(`/add-item/${id}`, data);
  }

  async payAndCloseTab(id, data) {
    return this.post(`/close/${id}/payment`, data);
  }
}

class BarInventoryService extends BaseApiService {
  constructor() {
    super('/restaurant/bar-inventory');
  }

  async getByAuth() {
    return this.get('/getbyauth');
  }

  async adjustStock(id, data) {
    return this.put(`/adjust-stock/${id}`, data);
  }

  async getStatistics() {
    return this.get('/statistics');
  }

  async search(query) {
    return this.get('/search', { query });
  }

  async filter(status) {
    return this.get('/filter', { status });
  }
}

class BarInventoryCategoryService extends BaseApiService {
  constructor() {
    super('/restaurant/bar-inventory-category');
  }
}

/**
 * Factory Method Pattern for creating API services.
 * Follows https://www.geeksforgeeks.org/system-design/factory-method-for-designing-pattern/
 */
class ServiceFactory {
  createService(type) {
    switch (type) {
      case 'bar-tabs':
        return new BarTabsService();
      case 'bar-inventory':
        return new BarInventoryService();
      case 'bar-inventory-category':
        return new BarInventoryCategoryService();
      default:
        throw new Error(`Service type ${type} is not defined in the factory.`);
    }
  }
}

export default new ServiceFactory();
