import api from '../api/api';
import { API_ENDPOINTS } from '../utils/constants';

class AuthService {
  // Login
  async login(credentials, role = 'Restaurant') {
    try {
      let endpoint;
      let payload = {
        password: credentials.password,
        rememberMe: credentials.rememberMe || false
      };

      if (role === 'Admin') {
        endpoint = API_ENDPOINTS.LOGIN_ADMIN;
        payload.adminId = credentials.email;
      } else if (role === 'Employee') {
        endpoint = API_ENDPOINTS.LOGIN_EMPLOYEE;
        payload.employee_login_code = credentials.email;
      } else {
        endpoint = API_ENDPOINTS.LOGIN_RESTAURANT;
        payload.email = credentials.email;
      }

      const response = await api.post(endpoint, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Verify Employee OTP
  async verifyEmployeeOTP(data) {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN_EMPLOYEE_VERIFY_OTP, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Resend Employee OTP
  async resendEmployeeOTP(data) {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN_EMPLOYEE_RESEND_OTP, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Register Restaurant
  async registerRestaurant(restaurantData) {
    try {
      const response = await api.post('/user/register-restaurant', restaurantData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Social Login (Google, Facebook, Apple)
  async loginSocial(provider, socialData) {
    try {
      const response = await api.post('/user/login-social', {
        provider,
        ...socialData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Logout
  async logout() {
    try {
      const response = await api.post(API_ENDPOINTS.LOGOUT);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send OTP for forgot password (normalized email per audit contract)
  async sendOTP(email) {
    try {
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
      const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD_SEND_OTP, { email: normalizedEmail });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Resend OTP for forgot password
  async resendForgotPasswordOTP(email) {
    try {
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
      const response = await api.post('/user/forget-password/resend-otp', { email: normalizedEmail });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Verify OTP and reset password
  async verifyOTPAndResetPassword(data) {
    try {
      const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD_VERIFY_OTP, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Change password
  async changePassword(data) {
    try {
      const response = await api.put(API_ENDPOINTS.CHANGE_PASSWORD, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update user profile
  async updateUser(data) {
    try {
      const response = await api.put(API_ENDPOINTS.USER_UPDATE, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // Server responded with error
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'No response from server. Please check your connection.',
        status: 0
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  }
}

export default new AuthService();
