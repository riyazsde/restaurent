import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ordersService from '../../services/ordersService';
import posService from '../../services/posService';
import { QUERY_KEYS } from '../../utils/queryKeys';

/**
 * Hook to fetch restaurant orders
 */
export const useOrders = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.ORDERS],
        queryFn: async () => {
            const response = await ordersService.getMyOrders();
            if (response && response.success !== false) {
                return response.data || [];
            }
            return [];
        },
        staleTime: 30 * 1000,
        refetchInterval: 60 * 1000,
    });
};

/**
 * Hook to update order status
 */
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updateData) => {
            const response = await posService.updateOrderStatus(updateData);
            if (response && response.success === false) {
                throw new Error(response.message || 'Failed to update order status');
            }
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KITCHEN_ORDERS] });
        }
    });
};

/**
 * Hook to update item status inside an order
 */
export const useUpdateOrderItemStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updateData) => {
            const response = await posService.updateItemStatus(updateData);
            if (response && response.success === false) {
                throw new Error(response.message || 'Failed to update item status');
            }
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KITCHEN_ORDERS] });
        }
    });
};

/**
 * Hook to get the current order of a table
 */
export const useCurrentTableOrder = (tableId, options = {}) => {
    return useQuery({
        queryKey: ['currentTableOrder', tableId],
        queryFn: async () => {
            if (!tableId) return null;
            const response = await posService.getCurrentOrder(tableId);
            return response?.data || null;
        },
        enabled: Boolean(tableId),
        ...options
    });
};

/**
 * Mutation hook to fetch current table order dynamically on demand
 */
export const useGetCurrentTableOrderMutation = (options = {}) => {
    return useMutation({
        mutationFn: async (tableId) => {
            const response = await posService.getCurrentOrder(tableId);
            return response;
        },
        ...options
    });
};

/**
 * Hook to update an existing POS order
 */
export const useUpdateOrder = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const response = await posService.updateOrder(payload);
            if (response && response.success === false) {
                throw new Error(response.message || 'Failed to update order');
            }
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
            queryClient.invalidateQueries({ queryKey: ['currentTableOrder'] });
        },
        ...options
    });
};
