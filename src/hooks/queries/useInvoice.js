import { useQuery, useMutation } from '@tanstack/react-query';
import invoiceService from '../../services/invoiceService';
import posService from '../../services/posService';
import { QUERY_KEYS } from '../../utils/queryKeys';

export const useInvoices = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.INVOICES],
        queryFn: () => invoiceService.getInvoicesByAuth(),
        keepPreviousData: true,
    });
};

export const usePayments = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.PAYMENTS],
        queryFn: async () => {
            const response = await posService.getAllPayments();
            if (response && response.success !== false) {
                return response.data || [];
            }
            return [];
        },
        staleTime: 60 * 1000,
    });
};

export const useGeneratePosInvoice = () => {
    return useMutation({
        mutationFn: (orderId) => invoiceService.generatePosInvoice(orderId),
    });
};

export const useExportInvoices = () => {
    return useMutation({
        mutationFn: () => invoiceService.exportInvoices(),
    });
};

