import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import addonsService from '../../services/addonsService';
import { toast } from 'react-toastify';

export const QUERY_KEYS = {
    ADDONS: 'ADDONS',
};

export const useAddons = () => {
    const queryClient = useQueryClient();

    const getAddons = useQuery({
        queryKey: [QUERY_KEYS.ADDONS],
        queryFn: async () => {
            const res = await addonsService.getAllAddons();
            return res.success !== undefined ? res.data : res;
        }
    });

    const createAddon = useMutation({
        mutationFn: async (data) => {
            const res = await addonsService.createAddon(data);
            if (res.success === false) throw new Error(res.message || 'Failed to create addon');
            return res.data || res;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADDONS] });
            toast.success('Addon created successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const deleteAddon = useMutation({
        mutationFn: async (id) => {
            const res = await addonsService.deleteAddon(id);
            if (res.success === false) throw new Error(res.message || 'Failed to delete addon');
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADDONS] });
            toast.success('Addon deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const mapAddonToItem = useMutation({
        mutationFn: async (mapData) => {
            const res = await addonsService.mapAddonToItem(mapData);
            if (res.success === false) throw new Error(res.message || 'Failed to map addon');
            return res.data || res;
        }
    });

    const getMappedAddonsMutation = useMutation({
        mutationFn: async (itemId) => {
            const res = await addonsService.getMappedAddonsByItemId(itemId);
            return res.success !== undefined ? res.data : res;
        }
    });

    return {
        getAddons,
        createAddon,
        deleteAddon,
        mapAddonToItem,
        getMappedAddonsMutation
    };
};

export const useMappedAddons = (itemId, options = {}) => {
    return useQuery({
        queryKey: [QUERY_KEYS.ADDONS, 'mapped', itemId],
        queryFn: async () => {
            if (!itemId) return [];
            const res = await addonsService.getMappedAddonsByItemId(itemId);
            return res.success !== undefined ? res.data : res;
        },
        enabled: Boolean(itemId),
        ...options
    });
};

export const useMapAddonToItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (mapData) => {
            const res = await addonsService.mapAddonToItem(mapData);
            if (res.success === false) throw new Error(res.message || 'Failed to map addon');
            return res.data || res;
        },
        onSuccess: (_, variables) => {
            if (variables?.item_id) {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADDONS, 'mapped', variables.item_id] });
            }
        }
    });
};

