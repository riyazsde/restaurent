import api from '../api/api';

class FeedbackService {
  // Get all feedback types
  async getAllFeedbackTypes(page = 1, limit = 10, search = '') {
    try {
      const response = await api.get('/master/feedback_type/getall', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get feedback summary (for dashboard cards)
  async getFeedbackSummary(filters = {}) {
    try {
      const response = await api.get('/restaurant/employee_feedback/getall', {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all feedbacks
  async getAllFeedbacks(params = {}) {
    try {
      const queryParams = { 
        page: params.page || 1, 
        limit: params.limit || 10 
      };
      
      if (params.search) queryParams.search = params.search;
      if (params.from) queryParams.from = params.from;
      if (params.to) queryParams.to = params.to;

      const response = await api.get('/master/feedback/getall', {
        params: queryParams
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get feedback by auth (GET /api/v1/master/feedback/getbyauth)
  async getFeedbackByAuth() {
    try {
      const response = await api.get('/master/feedback/getbyauth');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Export feedback to CSV (GET /api/v1/master/feedback/export)
  async exportFeedback(params = {}) {
    try {
      const response = await api.get('/master/feedback/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get single feedback by ID
  async getFeedbackById(id) {
    try {
      const response = await api.get(`/master/feedback/get/${id}`);
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

export default new FeedbackService();
