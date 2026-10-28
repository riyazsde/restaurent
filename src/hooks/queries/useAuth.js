import { useQuery, useMutation } from '@tanstack/react-query';
import authService from '../../services/authService';
import api from '../../api/api';

/**
 * Hook to fetch available countries
 */
export const useCountries = () => {
    return useQuery({
        queryKey: ['countries'],
        queryFn: async () => {
            const res = await api.get('/admin/country/getall');
            return res?.data?.data || res?.data || [];
        },
        staleTime: 1000 * 60 * 60, // Cache for 1 hour
        retry: 1
    });
};

/**
 * Hook for user login mutation
 */
export const useLogin = (options = {}) => {
    return useMutation({
        mutationFn: ({ credentials, role }) => authService.login(credentials, role),
        ...options
    });
};

/**
 * Hook for restaurant registration mutation
 */
export const useRegisterRestaurant = (options = {}) => {
    return useMutation({
        mutationFn: (restaurantData) => authService.registerRestaurant(restaurantData),
        ...options
    });
};

/**
 * Hook for social login
 */
export const useSocialLogin = (options = {}) => {
    return useMutation({
        mutationFn: ({ provider, socialData }) => authService.loginSocial(provider, socialData),
        ...options
    });
};

/**
 * Hook for logout mutation
 */
export const useLogout = (options = {}) => {
    return useMutation({
        mutationFn: () => authService.logout(),
        ...options
    });
};

/**
 * Hook for sending OTP for forgot password
 */
export const useSendOtp = (options = {}) => {
    return useMutation({
        mutationFn: (email) => authService.sendOTP(email),
        ...options
    });
};

/**
 * Hook for resending OTP for forgot password
 */
export const useResendForgotPasswordOtp = (options = {}) => {
    return useMutation({
        mutationFn: (email) => authService.resendForgotPasswordOTP(email),
        ...options
    });
};

/**
 * Hook for verifying OTP and resetting password
 */
export const useVerifyOtpAndResetPassword = (options = {}) => {
    return useMutation({
        mutationFn: (data) => authService.verifyOTPAndResetPassword(data),
        ...options
    });
};

/**
 * Hook for changing password
 */
export const useChangePassword = (options = {}) => {
    return useMutation({
        mutationFn: (data) => authService.changePassword(data),
        ...options
    });
};

/**
 * Hook for updating user profile
 */
export const useUpdateUser = (options = {}) => {
    return useMutation({
        mutationFn: (data) => authService.updateUser(data),
        ...options
    });
};
