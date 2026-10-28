import api from '../api/api';

class ReviewService {
  // Get all review types
  async getAllReviewTypes(page = 1, limit = 10, search = '', ReviewFor = '') {
    try {
      const response = await api.get('/master/review_type/getall', {
        params: { page, limit, search, ReviewFor }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all reviews
  async getAllReviews(page = 1, limit = 10, search = '', Review_Type_id = '', for_Review_id = '', ReviewStarCount = '') {
    try {
      const response = await api.get('/master/review/getall', {
        params: { page, limit, search, Review_Type_id, for_Review_id, ReviewStarCount }
      });
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

export default new ReviewService();
