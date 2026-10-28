import { create } from 'zustand';
import { getCookie, setCookie, removeCookie } from '../utils/cookies';
import { COOKIE_NAMES } from '../utils/constants';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  userRole: null, // Add userRole
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Initialize auth state from cookies
  initAuth: () => {
    const token = getCookie(COOKIE_NAMES.AUTH_TOKEN);
    const userData = getCookie(COOKIE_NAMES.USER_DATA);
    const userRole = getCookie('user_role'); // Get userRole
    
    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        set({ 
          user, 
          token, 
          userRole: userRole || 'Restaurant', // Default to Restaurant
          isAuthenticated: true,
          isLoading: false 
        });
      } catch (error) {
        console.error('Failed to parse user data:', error);
        get().logout();
      }
    } else if (token) {
      set({ 
        token, 
        userRole: userRole || 'Restaurant', 
        isAuthenticated: true, 
        isLoading: false 
      });
    } else {
      set({ isLoading: false });
    }
  },

  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Set error
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),

  // Login action
  login: (userData, token, role = 'Restaurant') => {
    // Store token in cookie
    setCookie(COOKIE_NAMES.AUTH_TOKEN, token, 7);
    
    // Store user data in cookie
    setCookie(COOKIE_NAMES.USER_DATA, encodeURIComponent(JSON.stringify(userData)), 7);
    
    // Store user role in cookie
    setCookie('user_role', role, 7);
    
    set({
      user: userData,
      token,
      userRole: role,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  },

  // Logout action
  logout: () => {
    // Remove cookies
    removeCookie(COOKIE_NAMES.AUTH_TOKEN);
    removeCookie(COOKIE_NAMES.USER_DATA);
    removeCookie(COOKIE_NAMES.REFRESH_TOKEN);
    removeCookie('user_role');
    
    set({
      user: null,
      token: null,
      userRole: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  },

  // Update user data
  updateUser: (userData) => {
    setCookie(COOKIE_NAMES.USER_DATA, encodeURIComponent(JSON.stringify(userData)), 7);
    set({ user: userData });
  }
}));

export default useAuthStore;
