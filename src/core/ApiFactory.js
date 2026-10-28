import axios from 'axios';

// A generic instance configured with base URL and headers if needed
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// The map of all possible API endpoints and methods mapped to a "type"
const apiConfig = {
  CONTACT: { method: 'POST', endpoint: '/contact' },
  PAYMENT: { method: 'POST', endpoint: '/payment' },
  GET_USER_DATA: { method: 'GET', endpoint: '/user-data' },
  // Add other API routes here following the factory pattern
    GENERATED_SLOTS: {
    method: 'GET',
    endpoint: '/restaurant/restaurant_slot/generated',
  },
};

/**
 * ApiFactory dynamically resolves the API request based on the type provided.
 * @param {string} type - The string identifier from apiConfig
 * @param {object} payload - The request body (for POST/PUT) or params (for GET)
 */
export const ApiFactory = async (type, payload = {}) => {
  const config = apiConfig[type];

  if (!config) {
    throw new Error(`API type "${type}" is not defined in ApiFactory.`);
  }

  // Simulate network delay and return mock data if no real API exists yet
  if (process.env.NODE_ENV === 'development' && (!process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL.includes('example.com'))) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { success: true, message: `Mock success for ${type}`, payload } });
      }, 1000);
    });
  }

  // Actual Axios request execution
  const response = await apiClient({
    method: config.method,
    url: config.endpoint,
    [config.method === 'GET' ? 'params' : 'data']: payload,
  });

  return response.data;
};
