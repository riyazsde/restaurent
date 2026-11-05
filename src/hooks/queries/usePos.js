import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import restaurantService from '../../services/restaurantService';
import taxSetupService from '../../services/taxSetupService';
import floorService from '../../services/floorService';
import itemsService from '../../services/itemsService';
import posService from '../../services/posService';
import { POS_KEYS, QUERY_KEYS } from '../../utils/queryKeys';
import { toast } from 'react-toastify';

/**
 * Fetch authenticated restaurant details
 */
export const useRestaurant = () => {
    return useQuery({
        queryKey: [POS_KEYS.RESTAURANT],
        queryFn: async () => {
            const res = await restaurantService.getRestaurantByAuth();
            if (res && res.success !== false) {
                return res.data || res;
            }
            return null;
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
};

/**
 * Fetch restaurant tax setup
 */
export const useTaxSetup = () => {
    return useQuery({
        queryKey: [POS_KEYS.TAX_SETUP],
        queryFn: async () => {
            const res = await taxSetupService.getTaxSetupByAuth();
            if (res && res.success !== false) {
                return res.data || [];
            }
            return [];
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
};

/**
 * Fetch mapped tables for dine-in assignment
 */
export const useMappedTables = () => {
    return useQuery({
        queryKey: [POS_KEYS.MAPPED_TABLES],
        queryFn: async () => {
            const res = await floorService.getMappedTables();
            if (res && res.success !== false) {
                return res.data || [];
            }
            return [];
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Background refresh every 60s
    });
};

/**
 * Fetch POS menu items, optionally filtered by category ID
 */
export const usePosItems = (categoryId = null) => {
    const isAll = !categoryId || categoryId === 'All';

    return useQuery({
        queryKey: [POS_KEYS.POS_ITEMS, isAll ? 'all' : categoryId],
        queryFn: async () => {
            if (isAll) {
                const res = await itemsService.getAllItems();
                if (res?.success === false) {
                    const error = new Error(res.message || 'Failed to load POS items');
                    error.status = Number(res.status || res.statusCode) || undefined;
                    throw error;
                }
                const rawList = res?.data || res || [];
                return Array.isArray(rawList) ? rawList.filter(item => item && item.Status !== false && item.status !== false) : [];
            } else {
                const res = await itemsService.getItemsByItemType(categoryId);
                if (res?.success === false) {
                    const error = new Error(res.message || 'Failed to load POS items');
                    error.status = Number(res.status || res.statusCode) || undefined;
                    throw error;
                }
                const rawList = res?.data || res || [];
                return Array.isArray(rawList) ? rawList.filter(item => item && item.Status !== false && item.status !== false) : [];
            }
        },
        staleTime: 0, // Fresh on every navigation to POS
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
    });
};

/**
 * Mutation for creating POS order
 */
export const useCreatePosOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderPayload) => {
            const response = await posService.createPosOrder(orderPayload);
            if (response && response.success === false) {
                throw new Error(response.message || 'Failed to create order');
            }
            return response;
        },
        onSuccess: (data) => {
            // Invalidate mapped tables so occupied table updates immediately
            queryClient.invalidateQueries({ queryKey: [POS_KEYS.MAPPED_TABLES] });
            // Invalidate kitchen orders so kitchen display updates
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KITCHEN_ORDERS] });
            // Invalidate orders list
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
        },
        onError: (error) => {
            console.error('Error creating POS order:', error);
        }
    });
};

/**
 * Hook to fetch payment options
 */
export const usePaymentOptions = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.PAYMENT_OPTIONS || 'payment-options'],
        queryFn: async () => {
            const res = await posService.getPaymentOptions();
            if (res && res.success !== false) {
                return res.data || [];
            }
            return [];
        },
        staleTime: 10 * 60 * 1000,
    });
};

/**
 * Mutation for creating payment
 */
export const useCreatePayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            const response = await posService.createPayment(payload);
            if (response && response.success === false) {
                throw new Error(response.message || 'Failed to create payment');
            }
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYMENTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
            queryClient.invalidateQueries({ queryKey: [POS_KEYS.MAPPED_TABLES] });
        }
    });
};
