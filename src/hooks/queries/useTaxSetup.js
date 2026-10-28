import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taxSetupService from '../../services/taxSetupService';
import { POS_KEYS } from '../../utils/queryKeys';

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
    });
};

export const useCreateTax = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const res = await taxSetupService.createTaxSetup(payload);
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to create tax setup');
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [POS_KEYS.TAX_SETUP] });
        }
    });
};

export const useUpdateTax = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const res = await taxSetupService.updateTaxSetup(payload);
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to update tax setup');
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [POS_KEYS.TAX_SETUP] });
        }
    });
};

export const useDeleteTax = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const res = await taxSetupService.deleteTaxSetup(id);
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to delete tax setup');
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [POS_KEYS.TAX_SETUP] });
        }
    });
};
