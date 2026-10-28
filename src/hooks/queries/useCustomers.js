import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../utils/queryKeys';
import customerService from '../../services/customerService';
import { toast } from 'react-toastify';

export const useCustomers = (searchQuery = '') => {
    return useQuery({
        queryKey: [QUERY_KEYS.CUSTOMERS, searchQuery],
        queryFn: async () => {
            if (searchQuery) {
                const response = await customerService.searchCustomers(searchQuery);
                if (response?.success === false) {
                    throw new Error(response.message || 'Failed to search customers');
                }
                return response.data || response || [];
            } else {
                const response = await customerService.getAllCustomerByAuth();
                if (response?.success === false) {
                    throw new Error(response.message || 'Failed to fetch customers');
                }
                return response.data || response || [];
            }
        },
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (customerData) => {
            const response = await customerService.createCustomer(customerData);
            if (response?.success === false) {
                throw new Error(response.message || 'Failed to create customer');
            }
            return response;
        },
        onSuccess: (data) => {
            // Optimistically update or invalidate
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
};

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (customerData) => {
            const response = await customerService.updateCustomer(customerData);
            if (response?.success === false) {
                throw new Error(response.message || 'Failed to update customer');
            }
            return response;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
};

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (customerId) => {
            const response = await customerService.deleteCustomer(customerId);
            if (response?.success === false) {
                throw new Error(response.message || 'Failed to delete customer');
            }
            return response;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
};

export const useSearchCustomersMutation = () => {
    return useMutation({
        mutationFn: async (searchQuery) => {
            const response = await customerService.searchCustomers(searchQuery);
            return response;
        }
    });
};

