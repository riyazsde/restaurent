import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import itemsService from '../../services/itemsService';
import menuService from '../../services/menuService';
import { POS_KEYS } from '../../utils/queryKeys';
import { toast } from 'react-toastify';

export const QUERY_KEYS = {
    MENU_ITEMS: 'MENU_ITEMS',
    MENU_QR: 'MENU_QR',
};

export const useMenuItems = () => {
    const queryClient = useQueryClient();

    const invalidateAllItemQueries = () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MENU_ITEMS] });
        queryClient.invalidateQueries({ queryKey: [POS_KEYS.POS_ITEMS] });
        queryClient.invalidateQueries({ queryKey: ['pos-items'] });
        queryClient.invalidateQueries({ queryKey: ['CATEGORIES'] });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
    };

    const getMenuItems = useQuery({
        queryKey: [QUERY_KEYS.MENU_ITEMS],
        queryFn: async () => {
            const res = await itemsService.getAllItems();
            return res.success !== undefined ? res.data : res;
        }
    });

    const createMenuItem = useMutation({
        mutationFn: async (data) => {
            const res = await itemsService.createItem(data);
            if (res.success === false) throw new Error(res.message || 'Failed to create menu item');
            return res.data || res;
        },
        onSuccess: (data) => {
            invalidateAllItemQueries();
            toast.success('Menu item created successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const updateMenuItem = useMutation({
        mutationFn: async (data) => {
            const res = await itemsService.updateItem(data);
            if (res.success === false) throw new Error(res.message || 'Failed to update menu item');
            return res.data || res;
        },
        onSuccess: (data) => {
            invalidateAllItemQueries();
            toast.success('Menu item updated successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const deleteMenuItem = useMutation({
        mutationFn: async (id) => {
            const res = await itemsService.deleteItem(id);
            if (res.success === false) throw new Error(res.message || 'Failed to delete menu item');
            return res;
        },
        onSuccess: () => {
            invalidateAllItemQueries();
            toast.success('Menu item deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return {
        getMenuItems,
        createMenuItem,
        updateMenuItem,
        deleteMenuItem
    };
};

/**
 * Mutation to generate menu QR code
 */
export const useGenerateMenuQrMutation = () => {
    return useMutation({
        mutationFn: async () => {
            return await menuService.generateMenuQr();
        }
    });
};

/**
 * Mutation to fetch item variants and addons in parallel
 */
export const useGetItemOptionsMutation = () => {
    return useMutation({
        mutationFn: async (itemId) => {
            const [variantsRes, addonsRes] = await Promise.all([
                itemsService.getItemMapVariants(itemId),
                itemsService.getItemMapAddons(itemId)
            ]);
            return {
                variants: variantsRes?.success && variantsRes.data ? variantsRes.data : [],
                addons: addonsRes?.success && addonsRes.data ? addonsRes.data : []
            };
        }
    });
};

/**
 * Hook to search menu items globally across categories (GET /api/v1/admin/items/search)
 */
export const useSearchMenuItems = (searchTerm, type, options = {}) => {
    return useQuery({
        queryKey: ['admin-items-search', searchTerm, type],
        queryFn: async () => {
            if (!searchTerm || !searchTerm.trim()) return [];
            const res = await itemsService.searchItems({ q: searchTerm.trim(), limit: 20, type });
            return res?.data || (Array.isArray(res) ? res : []);
        },
        enabled: Boolean(searchTerm && searchTerm.trim().length > 0),
        staleTime: 60 * 1000,
        ...options
    });
};
