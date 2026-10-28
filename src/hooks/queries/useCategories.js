import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import itemTypesService from '../../services/itemTypesService';
import { toast } from 'react-toastify';

export const QUERY_KEYS = {
    CATEGORIES: 'CATEGORIES',
};

export const useCategories = () => {
    const queryClient = useQueryClient();

    const getCategories = useQuery({
        queryKey: [QUERY_KEYS.CATEGORIES],
        queryFn: async () => {
            const res = await itemTypesService.getAllItemTypes();
            return res.success !== undefined ? res.data : res;
        }
    });

    const createCategory = useMutation({
        mutationFn: async (data) => {
            const res = await itemTypesService.createItemType(data);
            if (res.success === false) throw new Error(res.message || 'Failed to create category');
            return res.data || res;
        },
        onSuccess: (data) => {
            queryClient.setQueryData([QUERY_KEYS.CATEGORIES], (old) => {
                if (!old) return old;
                return data && data.Items_types_id ? [...old, data] : old;
            });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
            toast.success('Category created successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const updateCategory = useMutation({
        mutationFn: async (data) => {
            const res = await itemTypesService.updateItemType(data);
            if (res.success === false) throw new Error(res.message || 'Failed to update category');
            return res.data || res;
        },
        onSuccess: (data) => {
            queryClient.setQueryData([QUERY_KEYS.CATEGORIES], (old) => {
                if (!old) return old;
                return data && data.Items_types_id 
                    ? old.map(c => c.Items_types_id === data.Items_types_id ? data : c)
                    : old;
            });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
            toast.success('Category updated successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const deleteCategory = useMutation({
        mutationFn: async (id) => {
            const res = await itemTypesService.deleteItemType(id);
            if (res.success === false) throw new Error(res.message || 'Failed to delete category');
            return res;
        },
        onSuccess: (data, id) => {
            queryClient.setQueryData([QUERY_KEYS.CATEGORIES], (old) => {
                if (!old) return old;
                return old.filter(c => c.Items_types_id !== id);
            });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
            toast.success('Category deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return {
        getCategories,
        data: getCategories.data,
        isLoading: getCategories.isLoading,
        error: getCategories.error,
        createCategory,
        updateCategory,
        deleteCategory
    };
};
