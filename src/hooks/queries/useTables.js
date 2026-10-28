import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import tableService from '../../services/tableService';
import { toast } from 'react-toastify';

export const useTables = () => {
    const queryClient = useQueryClient();

    const getTables = useQuery({
        queryKey: ['TABLES'],
        queryFn: async () => {
            const res = await tableService.getAllTables();
            if (res.success) return res.data;
            throw new Error(res.message || 'Failed to fetch tables');
        }
    });

    const createTable = useMutation({
        mutationFn: async (data) => {
            const res = await tableService.createTable(data);
            if (!res.success) throw new Error(res.message || 'Failed to create table');
            return res.data;
        },
        onSuccess: (data) => {
            // Optimistic update for create
            queryClient.setQueryData(['TABLES'], (old) => {
                if (!old) return old;
                // If API returns created table, append it, else just invalidate
                return data && data.Table_id ? [...old, data] : old;
            });
            queryClient.invalidateQueries({ queryKey: ['TABLES'] });
            toast.success('Table created successfully');
        },
        onError: (error) => {
            const validationMsgs = error?.data?.errors?.map(e => e.msg).join(', ');
            toast.error(validationMsgs || error.message || 'Failed to create table');
        }
    });

    const updateTable = useMutation({
        mutationFn: async (data) => {
            const res = await tableService.updateTable(data);
            if (!res.success) throw new Error(res.message || 'Failed to update table');
            return res.data;
        },
        onSuccess: (data) => {
            // Optimistic update for update
            queryClient.setQueryData(['TABLES'], (old) => {
                if (!old) return old;
                // If API returns updated table, replace it, else just invalidate
                return data && data.Table_id 
                    ? old.map(t => t.Table_id === data.Table_id ? data : t)
                    : old;
            });
            queryClient.invalidateQueries({ queryKey: ['TABLES'] });
            toast.success('Table updated successfully');
        },
        onError: (error) => {
            const validationMsgs = error?.data?.errors?.map(e => e.msg).join(', ');
            toast.error(validationMsgs || error.message || 'Failed to update table');
        }
    });

    const deleteTable = useMutation({
        mutationFn: async (id) => {
            const res = await tableService.deleteTable(id);
            // Ignore format errors like "Expected double quote" if it was technically successful
            if (!res.success && res.message && !res.message.includes('Expected')) {
                throw new Error(res.message || 'Failed to delete table');
            }
            return res;
        },
        onSuccess: (data, id) => {
            // Optimistic update for delete
            queryClient.setQueryData(['TABLES'], (old) => {
                if (!old) return old;
                return old.filter(t => t.Table_id !== id);
            });
            queryClient.invalidateQueries({ queryKey: ['TABLES'] });
            toast.success('Table deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return {
        getTables,
        createTable,
        updateTable,
        deleteTable
    };
};

/**
 * Hook to get table QR code data
 */
export const useTableQr = (tableId, options = {}) => {
    return useQuery({
        queryKey: ['tableQr', tableId],
        queryFn: async () => {
            if (!tableId) return null;
            const res = await tableService.getTableQrData(tableId);
            return res?.data?.qr_code || res?.data?.qr || res?.data?.url || res?.data || null;
        },
        enabled: Boolean(tableId),
        ...options
    });
};

/**
 * Mutation hook to fetch table QR data dynamically on demand
 */
export const useGetTableQrMutation = (options = {}) => {
    return useMutation({
        mutationFn: async (tableId) => {
            const res = await tableService.getTableQrData(tableId);
            return res?.data?.qr_code || res?.data?.qr || res?.data?.url || res?.data || null;
        },
        ...options
    });
};
