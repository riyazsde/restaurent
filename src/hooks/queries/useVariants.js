import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import variantsService from '../../services/variantsService';
import { toast } from 'react-toastify';

export const QUERY_KEYS = {
    VARIANTS: 'VARIANTS',
};

export const useVariants = () => {
    const queryClient = useQueryClient();

    const getVariants = useQuery({
        queryKey: [QUERY_KEYS.VARIANTS],
        queryFn: async () => {
            const res = await variantsService.getAllVariants();
            return res.success !== undefined ? res.data : res;
        }
    });

    const createVariant = useMutation({
        mutationFn: async (data) => {
            const res = await variantsService.createVariant(data);
            if (res.success === false) throw new Error(res.message || 'Failed to create variant');
            return res.data || res;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VARIANTS] });
            toast.success('Variant created successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const deleteVariant = useMutation({
        mutationFn: async (id) => {
            const res = await variantsService.deleteVariant(id);
            if (res.success === false) throw new Error(res.message || 'Failed to delete variant');
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VARIANTS] });
            toast.success('Variant deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const mapVariantToItem = useMutation({
        mutationFn: async (mapData) => {
            const res = await variantsService.mapVariantToItem(mapData);
            if (res.success === false) throw new Error(res.message || 'Failed to map variant');
            return res.data || res;
        }
    });

    const getMappedVariantsMutation = useMutation({
        mutationFn: async (itemId) => {
            const res = await variantsService.getMappedVariantsByItemId(itemId);
            return res.success !== undefined ? res.data : res;
        }
    });

    return {
        getVariants,
        createVariant,
        deleteVariant,
        mapVariantToItem,
        getMappedVariantsMutation
    };
};

export const useMappedVariants = (itemId, options = {}) => {
    return useQuery({
        queryKey: [QUERY_KEYS.VARIANTS, 'mapped', itemId],
        queryFn: async () => {
            if (!itemId) return [];
            const res = await variantsService.getMappedVariantsByItemId(itemId);
            return res.success !== undefined ? res.data : res;
        },
        enabled: Boolean(itemId),
        ...options
    });
};

export const useMapVariantToItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (mapData) => {
            const res = await variantsService.mapVariantToItem(mapData);
            if (res.success === false) throw new Error(res.message || 'Failed to map variant');
            return res.data || res;
        },
        onSuccess: (_, variables) => {
            if (variables?.item_id) {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.VARIANTS, 'mapped', variables.item_id] });
            }
        }
    });
};

