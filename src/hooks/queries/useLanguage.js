import { useQuery } from '@tanstack/react-query';
import languageService from '../../services/languageService';

export const LANGUAGE_KEYS = {
    ALL: ['languages'],
};

/**
 * Hook to fetch all available languages
 */
export const useLanguages = (options = {}) => {
    return useQuery({
        queryKey: LANGUAGE_KEYS.ALL,
        queryFn: async () => {
            const response = await languageService.getAllLanguages();
            if (response && response.success !== false) {
                return response.data || [];
            }
            return [];
        },
        staleTime: 60 * 60 * 1000, // 1 hour caching for system languages
        ...options
    });
};
