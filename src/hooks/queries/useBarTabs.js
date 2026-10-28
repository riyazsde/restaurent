import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { default as barService } from '../../services/barService';
import useTranslatedToast from '../useTranslatedToast';

export const useBarTabs = () => {
    const queryClient = useQueryClient();
    const toast = useTranslatedToast();
    
    // Fallback if barService is actually an instance or exported differently
    const apiService = typeof barService === 'object' && barService.listBarTabs ? barService : new barService();

    // 1. Fetch Open Bar Tabs
    const getBarTabs = useQuery({
        queryKey: ['barTabs'],
        queryFn: async () => {
            const res = await apiService.listBarTabs('Open');
            return res.success !== undefined ? (res.data || []) : res;
        },
        staleTime: 5 * 60 * 1000,
    });

    // 2. Fetch Tab by ID is moved to a separate hook below to fix Rules of Hooks

    // 3. Create a New Bar Tab
    const createBarTab = useMutation({
        mutationFn: (data) => apiService.openBarTab(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['barTabs']);
            toast.success("Bar tab opened successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to open bar tab");
        }
    });

    // 4. Add Item to Tab
    const addItemToTab = useMutation({
        mutationFn: ({ id, data }) => apiService.addItemToTab(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['barTabs']);
            queryClient.invalidateQueries(['barTabs', variables.id]);
            toast.success("Item added successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to add item to tab");
        }
    });

    // 5. Close Tab
    const closeTab = useMutation({
        mutationFn: ({ id, data }) => apiService.payAndCloseTab(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['barTabs']);
            queryClient.invalidateQueries(['barTabs', variables.id]);
            toast.success("Bar tab closed successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to close bar tab");
        }
    });

    return {
        getBarTabs,
        createBarTab,
        addItemToTab,
        closeTab
    };
};

export const useBarTabById = (id) => {
    const apiService = typeof barService === 'object' && barService.listBarTabs ? barService : new barService();
    return useQuery({
        queryKey: ['barTabs', id],
        queryFn: () => apiService.getBarTabById(id),
        enabled: !!id,
    });
};
