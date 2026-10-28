import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import promotionService from '../../services/promotionService';

export const usePromotions = (params) => {
    return useQuery({
        queryKey: ['promotions', params],
        queryFn: () => promotionService.getAll(params),
        placeholderData: (previousData) => previousData,
    });
};

export const usePromotionById = (id) => {
    return useQuery({
        queryKey: ['promotions', id],
        queryFn: () => promotionService.getById(id),
        enabled: !!id,
    });
};

export const useCreatePromotion = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data) => promotionService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            toast.success('Promotion created successfully');
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to create promotion');
        }
    });
};

export const useUpdatePromotion = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data) => promotionService.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            toast.success('Promotion updated successfully');
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to update promotion');
        }
    });
};

export const useTogglePromotionStatus = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, status }) => promotionService.toggleStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            toast.success('Status updated successfully');
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to update status');
        }
    });
};

export const useDeletePromotion = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id) => promotionService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            toast.success('Promotion deleted successfully');
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to delete promotion');
        }
    });
};
