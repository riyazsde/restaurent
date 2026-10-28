import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const websiteApi = {
  // Public Website endpoints
  getPublicFeatures: () => api.get(API_ENDPOINTS.WEBSITE_KEY_FEATURES_PUBLIC),
  getPublicStatistics: () => api.get(API_ENDPOINTS.WEBSITE_STATISTICS_PUBLIC),

  // Admin Key Features CRUD
  getAllFeatures: (params) => api.get(API_ENDPOINTS.WEBSITE_KEY_FEATURES_GET_ALL, { params }),
  getFeatureById: (id) => api.get(`${API_ENDPOINTS.WEBSITE_KEY_FEATURES_GET_BY_ID}/${id}`),
  createFeature: (data) => api.post(API_ENDPOINTS.WEBSITE_KEY_FEATURES_CREATE, data),
  updateFeature: (id, data) => api.put(`${API_ENDPOINTS.WEBSITE_KEY_FEATURES_UPDATE}/${id}`, data),
  deleteFeature: (id) => api.delete(`${API_ENDPOINTS.WEBSITE_KEY_FEATURES_DELETE}/${id}`),

  // Admin Website Statistics CRUD
  getAllStatistics: (params) => api.get(API_ENDPOINTS.WEBSITE_STATISTICS_GET_ALL, { params }),
  createStatistic: (data) => api.post(API_ENDPOINTS.WEBSITE_STATISTICS_CREATE, data),
  updateStatistic: (id, data) => api.put(`${API_ENDPOINTS.WEBSITE_STATISTICS_UPDATE}/${id}`, data),
  deleteStatistic: (id) => api.delete(`${API_ENDPOINTS.WEBSITE_STATISTICS_DELETE}/${id}`)
};
