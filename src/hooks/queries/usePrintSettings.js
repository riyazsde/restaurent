import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import printSettingsService from '../../services/printSettingsService';
import { QUERY_KEYS } from '../../utils/queryKeys';

export const usePrintSettings = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.PRINT_SETTINGS],
        queryFn: async () => {
            const res = await printSettingsService.getPrintSettingsByAuth();
            if (res && res.success !== false) {
                return res.data || [];
            }
            return [];
        },
    });
};

export const useUpdatePrintSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const res = await printSettingsService.updatePrintSettings(payload);
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to update print settings');
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRINT_SETTINGS] });
        }
    });
};
