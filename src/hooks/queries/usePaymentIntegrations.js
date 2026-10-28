import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { merchantPaymentConfigApi } from '../../api/merchantPaymentConfig.api';
import { terminalPaymentsApi } from '../../api/terminalPayments.api';
import { mobileMoneyApi } from '../../api/mobileMoney.api';
import { QUERY_KEYS } from '../../utils/queryKeys';

export const PAYMENT_INTEGRATION_KEYS = {
    CONFIGS: ['merchant_payment_configs'],
    TERMINAL_STATUS: (attemptId) => ['terminal_payment_status', attemptId],
    MERCHANT_TRANSACTIONS: (merchantId) => ['merchant_transactions', merchantId],
};

/**
 * Hook to fetch restaurant merchant payment provider configs (GET /payments/merchant-payment-config)
 */
export const useMerchantPaymentConfigs = (options = {}) => {
    return useQuery({
        queryKey: PAYMENT_INTEGRATION_KEYS.CONFIGS,
        queryFn: async () => {
            const response = await merchantPaymentConfigApi.list();
            if (response?.data && response.data.success !== false) {
                return Array.isArray(response.data.data)
                    ? response.data.data
                    : Array.isArray(response.data)
                    ? response.data
                    : [];
            }
            return [];
        },
        staleTime: 5 * 60 * 1000,
        ...options
    });
};

/**
 * Hook to save/update merchant provider config (PUT /payments/merchant-payment-config/:provider)
 */
export const useSaveMerchantPaymentConfig = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ provider, data }) => {
            const response = await merchantPaymentConfigApi.createOrUpdate(provider, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PAYMENT_INTEGRATION_KEYS.CONFIGS });
        },
        ...options
    });
};

/**
 * Hook to initiate card payment on Z500C terminal (POST /employee/terminal-payments/start)
 */
export const useStartTerminalPayment = (options = {}) => {
    return useMutation({
        mutationFn: async (payload) => {
            const response = await terminalPaymentsApi.start(payload);
            return response.data;
        },
        ...options
    });
};

/**
 * Hook to poll terminal card attempt status (GET /employee/terminal-payments/:attemptId)
 */
export const useTerminalPaymentStatus = (attemptId, options = {}) => {
    return useQuery({
        queryKey: PAYMENT_INTEGRATION_KEYS.TERMINAL_STATUS(attemptId),
        queryFn: async () => {
            if (!attemptId) return null;
            const response = await terminalPaymentsApi.getStatus(attemptId);
            return response.data?.data || response.data || null;
        },
        enabled: Boolean(attemptId),
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            // Stop polling once final state is reached
            if (['Approved', 'Declined', 'Cancelled', 'Error', 'Reversed'].includes(status)) {
                return false;
            }
            return 2000; // Poll every 2 seconds while Pending or AwaitingBankConfirmation
        },
        ...options
    });
};

/**
 * Hook to record acquirer-confirmed card reversal (POST /employee/terminal-payments/:attemptId/reverse)
 */
export const useReverseTerminalPayment = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ attemptId, data }) => {
            const response = await terminalPaymentsApi.recordReversal(attemptId, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: PAYMENT_INTEGRATION_KEYS.TERMINAL_STATUS(variables.attemptId)
            });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
        },
        ...options
    });
};

/**
 * Hook to start mobile money collection (POST /payments/mobile-money/request)
 */
export const useStartMobileMoneyPayment = (options = {}) => {
    return useMutation({
        mutationFn: async (payload) => {
            const response = await mobileMoneyApi.requestPayment(payload);
            return response.data;
        },
        ...options
    });
};

/**
 * Hook to query merchant transactions for MoMo status polling (GET /payments/transactions/merchant/:merchantId)
 */
export const useMerchantTransactions = (merchantId, params = { page: 1, limit: 10 }, options = {}) => {
    return useQuery({
        queryKey: [...PAYMENT_INTEGRATION_KEYS.MERCHANT_TRANSACTIONS(merchantId), params],
        queryFn: async () => {
            if (!merchantId) return [];
            const response = await mobileMoneyApi.getTransactionsByMerchant(merchantId, params);
            return response.data?.data || response.data || [];
        },
        enabled: Boolean(merchantId),
        ...options
    });
};
