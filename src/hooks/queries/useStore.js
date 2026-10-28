import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import storeService from '../../services/storeService';
import restaurantService from '../../services/restaurantService';
import fileUploadService from '../../services/fileUploadService';
import { STORE_KEYS, POS_KEYS } from '../../utils/queryKeys';

/**
 * Hook to fetch authenticated store details
 */
export const useStoreDetails = () => {
    return useQuery({
        queryKey: [STORE_KEYS.DETAILS],
        queryFn: async () => {
            const res = await storeService.getStoreByAuth();
            if (res && res.success !== false) {
                return res.data || res;
            }
            return null;
        },
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Hook to update store details
 */
export const useUpdateStoreDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updateData) => {
            const res = await storeService.updateStore(updateData);
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to update store');
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [STORE_KEYS.DETAILS] });
            queryClient.invalidateQueries({ queryKey: [POS_KEYS.RESTAURANT] });
        },
        onError: (error) => {
            console.error('Update store error:', error);
        }
    });
};

/**
 * Hook to upload store image
 */
export const useUploadStoreImage = () => {
    return useMutation({
        mutationFn: async (file) => {
            const res = await fileUploadService.uploadFile(file);
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to upload image');
            }
            return res;
        },
        onError: (error) => {
            console.error('Store image upload error:', error);
        }
    });
};

/**
 * Hook to talk to a POS specialist / expert
 */
export const useTalkToExpert = (options = {}) => {
    return useMutation({
        mutationFn: async (data) => {
            return await restaurantService.talkToExpert(data);
        },
        ...options
    });
};

/**
 * Hook to fetch restaurant subscription details
 */
export const useRestaurantSubscription = () => {
    return useQuery({
        queryKey: [STORE_KEYS.SUBSCRIPTION],
        queryFn: async () => {
            const res = await storeService.getSubscriptionPurchased();
            if (res && res.success !== false) {
                return res.data || res;
            }
            return null;
        },
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Hook to renew restaurant subscription
 */
export const useRenewSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload = {}) => {
            const res = await storeService.renewSubscription(payload);
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to renew subscription');
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [STORE_KEYS.SUBSCRIPTION] });
        }
    });
};

/**
 * Hook to fetch restaurant service charge (GET /api/v1/restaurant/store_details/service-charge)
 */
export const useServiceCharge = () => {
    return useQuery({
        queryKey: ['serviceCharge'],
        queryFn: async () => {
            const res = await storeService.getServiceCharge();
            if (res && res.success !== false) {
                return res.data || res;
            }
            return null;
        },
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Hook to update restaurant service charge (PUT /api/v1/restaurant/store_details/service-charge)
 */
export const useUpdateServiceCharge = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (percent) => {
            const res = await storeService.updateServiceCharge(percent);
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to update service charge');
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['serviceCharge'] });
            queryClient.invalidateQueries({ queryKey: [STORE_KEYS.DETAILS] });
            queryClient.invalidateQueries({ queryKey: [POS_KEYS.RESTAURANT] });
        }
    });
};

