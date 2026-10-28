import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import paymentTypeService from '../../services/paymentTypeService';
import { QUERY_KEYS } from '../../utils/queryKeys';

export const usePaymentTypes = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.PAYMENT_TYPES],
        queryFn: async () => {
            const res = await paymentTypeService.getPaymentTypesByAuth();
            if (res && res.success !== false) {
                return res.data || [];
            }
            return [];
        },
    });
};

export const useCreatePaymentType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const res = await paymentTypeService.createPaymentType(payload);
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to create payment type');
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYMENT_TYPES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYMENT_OPTIONS] });
        }
    });
};

export const useUpdatePaymentType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await paymentTypeService.updatePaymentType(id, data);
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to update payment type');
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYMENT_TYPES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYMENT_OPTIONS] });
        }
    });
};

export const useDeletePaymentType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const res = await paymentTypeService.deletePaymentType(id);
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to delete payment type');
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYMENT_TYPES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYMENT_OPTIONS] });
        }
    });
};

export const useCreatePaymentOption = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const res = await paymentTypeService.createPaymentOption(payload);
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to create payment option');
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYMENT_TYPES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYMENT_OPTIONS || 'payment-options'] });
        }
    });
};

export const usePaymentOptionsAuth = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.PAYMENT_OPTIONS || 'payment-options'],
        queryFn: async () => {
            const res = await paymentTypeService.getPaymentOptionsByAuth();
            if (res && res.success !== false) {
                return res.data || [];
            }
            return [];
        }
    });
};

