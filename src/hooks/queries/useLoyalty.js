import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import loyaltyService from '../../services/loyaltyService';

export const useLoyaltyTiers = () => {
    return useQuery({
        queryKey: ['loyaltyTiers'],
        queryFn: () => loyaltyService.getTiers(),
    });
};

export const useCreateTier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => loyaltyService.createTier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loyaltyTiers'] });
            toast.success('Loyalty tier created');
        }
    });
};

export const useUpdateTier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => loyaltyService.updateTier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loyaltyTiers'] });
            toast.success('Loyalty tier updated');
        }
    });
};

export const useDeleteTier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => loyaltyService.deleteTier(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loyaltyTiers'] });
            toast.success('Loyalty tier deleted');
        }
    });
};

export const useHappyHourSettings = () => {
    return useQuery({
        queryKey: ['happyHourSettings'],
        queryFn: () => loyaltyService.getHappyHourSettings(),
    });
};

export const useUpdateHappyHour = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => loyaltyService.updateHappyHourSettings(data),
        onMutate: async (newSettings) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['happyHourSettings'] });

            // Snapshot the previous value
            const previousSettings = queryClient.getQueryData(['happyHourSettings']);

            // Optimistically update to the new value
            queryClient.setQueryData(['happyHourSettings'], { data: newSettings });

            // Return a context with the previous settings so we can rollback if it fails
            return { previousSettings };
        },
        onError: (err, newSettings, context) => {
            // Roll back to the previous value if mutation fails
            queryClient.setQueryData(['happyHourSettings'], context.previousSettings);
            toast.error('Failed to save Happy Hour settings');
        },
        onSuccess: () => {
            toast.success('Happy Hour settings saved');
        },
        onSettled: () => {
            // Always refetch to ensure server and client are in sync
            queryClient.invalidateQueries({ queryKey: ['happyHourSettings'] });
        }
    });
};

export const useLoyaltyRules = () => {
    return useQuery({
        queryKey: ['loyaltyRules'],
        queryFn: async () => {
            try {
                const res = await loyaltyService.getLoyaltyRules();
                return res?.data || res || null;
            } catch (err) {
                console.warn('Could not fetch loyalty rules:', err);
                return null;
            }
        },
        retry: false
    });
};

export const useAdjustCustomerPoints = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ customerId, points, action, notes }) =>
            loyaltyService.adjustCustomerPoints(customerId, { points, action, notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['loyaltyTiers'] });
        }
    });
};

export const useAddLoyaltyPoints = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => loyaltyService.addLoyaltyPoints(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['loyaltyTiers'] });
        }
    });
};

export const useRedeemLoyaltyPoints = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => loyaltyService.redeemLoyaltyPoints(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['loyaltyTiers'] });
        }
    });
};

