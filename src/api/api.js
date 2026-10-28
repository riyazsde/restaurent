import axios from 'axios';
import { getCookie, removeCookie } from '../utils/cookies';
import { COOKIE_NAMES, API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getCookie(COOKIE_NAMES.AUTH_TOKEN);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If the data is FormData, remove the Content-Type header to let the browser set it automatically
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = getCookie(COOKIE_NAMES.REFRESH_TOKEN);
        
        if (refreshToken) {
          const authBaseUrl = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || API_BASE_URL;
          const response = await axios.post(
            `${authBaseUrl}/auth/refresh-token`,
            { refreshToken }
          );

          if (response.data.success) {
            const { accessToken } = response.data.data;
            
            // Update cookie with new token
            const expires = new Date();
            expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000));
            document.cookie = `${COOKIE_NAMES.AUTH_TOKEN}=${accessToken};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // If refresh fails, logout user
      removeCookie(COOKIE_NAMES.AUTH_TOKEN);
      removeCookie(COOKIE_NAMES.REFRESH_TOKEN);
      removeCookie(COOKIE_NAMES.USER_DATA);
      
      // Redirect to login only if not already on login page
      if (!window.location.pathname.includes('/signin')) {
        window.location.href = '/signin';
      }
    }

    return Promise.reject(error);
  }
);

export default api;