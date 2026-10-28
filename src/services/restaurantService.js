import api from '../api/api';

class RestaurantService {
  // Get restaurant by auth
  async getRestaurantByAuth() {
    try {
      const response = await api.get('/restaurant/store_details/getbyauth');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Talk to a POS specialist / expert lead capture form
  async talkToExpert(data) {
    try {
      const payload = {
        Name: data?.Name || data?.name || '',
        Business_Name: data?.Business_Name || data?.business_name || data?.businessName || '',
        Email: data?.Email || data?.email || '',
        PhoneNo: data?.PhoneNo || data?.phone || data?.phoneNumber || data?.phoneNo || ''
      };
      const response = await api.post('/admin/posspealist/create', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create public subscription payment from website
  async createPublicSubscriptionPayment(data) {
    try {
      const response = await api.post('/master/subscriptions_payment/create', data);
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

export default new RestaurantService();
