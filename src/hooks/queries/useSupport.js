import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import supportTicketService from '../../services/supportTicketService';
import faqService from '../../services/faqService';

export const SUPPORT_KEYS = {
    TICKETS: 'support-tickets',
    TICKET_TYPES: 'support-ticket-types',
    TICKET_REPLIES: 'support-ticket-replies'
};

export const useTickets = () => {
    return useQuery({
        queryKey: [SUPPORT_KEYS.TICKETS],
        queryFn: async () => {
            const res = await supportTicketService.getAllTickets();
            if (res && res.success !== false) {
                return res.data || [];
            }
            return [];
        },
        staleTime: 60 * 1000,
    });
};

export const useTicketTypes = () => {
    return useQuery({
        queryKey: [SUPPORT_KEYS.TICKET_TYPES],
        queryFn: async () => {
            const res = await supportTicketService.getAllTicketTypes();
            if (res && res.success !== false) {
                return res.data || [];
            }
            return [];
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useTicketReplies = (ticketId = null) => {
    return useQuery({
        queryKey: ticketId ? [SUPPORT_KEYS.TICKET_REPLIES, ticketId] : [SUPPORT_KEYS.TICKET_REPLIES],
        queryFn: async () => {
            const res = await supportTicketService.getAllTicketReplies(ticketId);
            if (res && res.success !== false) {
                return res.data || [];
            }
            return [];
        },
        staleTime: 30 * 1000,
    });
};

export const useTicketById = (ticketId) => {
    return useQuery({
        queryKey: [SUPPORT_KEYS.TICKETS, ticketId],
        queryFn: async () => {
            if (!ticketId) return null;
            const res = await supportTicketService.getTicketById(ticketId);
            if (res && res.success !== false) {
                return res.data || null;
            }
            return null;
        },
        enabled: Boolean(ticketId),
        staleTime: 60 * 1000,
    });
};

export const useCreateTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ticketData) => {
            const res = await supportTicketService.createTicket(ticketData);
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to create ticket');
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SUPPORT_KEYS.TICKETS] });
        }
    });
};

export const useCreateTicketReply = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (replyData) => {
            const res = await supportTicketService.createTicketReply(replyData);
            if (res && res.success === false) {
                throw new Error(res.message || 'Failed to send reply');
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SUPPORT_KEYS.TICKET_REPLIES] });
        }
    });
};

/**
 * Hook to get FAQs for restaurant support
 */
export const useFaqs = (options = {}) => {
    return useQuery({
        queryKey: ['faqs'],
        queryFn: async () => {
            const response = await faqService.getFaqsByAuth();
            if (response && response.success !== false) {
                return response.data || [];
            }
            return [];
        },
        staleTime: 5 * 60 * 1000,
        ...options
    });
};
