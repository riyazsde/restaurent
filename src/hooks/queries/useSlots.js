import { useQuery } from '@tanstack/react-query';
import api from '../../api/api'; 

export const useGeneratedSlots = (tableId, options = {}) => {
    return useQuery({
        queryKey: ['restaurant-slots', tableId],
        queryFn: async () => {
            const res = await api.get('/restaurant/restaurant_slot/generated', {
                params: { table_id: tableId },
            });
            return res.data;
        },
        enabled: !!tableId,
        staleTime: 60 * 1000,
        ...options,
    });
};