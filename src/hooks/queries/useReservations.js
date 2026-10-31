import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import reservationService from '../../services/reservationService';
import slotsService from '../../services/slotsService';

export const RESERVATION_KEYS = {
    ALL: ['reservations'],
    SEARCH: (params) => ['reservations', 'search', params],
    DETAILS: (id) => ['reservations', 'detail', id],
    SLOTS: ['restaurantSlots'],
    GENERATED_SLOTS: (tableId) => ['generatedSlots', tableId || 'all'],
};

/**
 * Hook to get all reservations for authenticated restaurant
 */
export const useReservations = (options = {}) => {
    return useQuery({
        queryKey: RESERVATION_KEYS.ALL,
        queryFn: async () => {
            const res = await reservationService.getReservationsByAuth();
            if (res && res.success !== false) {
                return res.data || [];
            }
            return [];
        },
        ...options
    });
};

/**
 * Hook to search/filter reservations
 */
export const useSearchReservations = (params = {}, options = {}) => {
    return useQuery({
        queryKey: RESERVATION_KEYS.SEARCH(params),
        queryFn: async () => {
            const res = await reservationService.searchReservations(params);
            if (res && res.success !== false) {
                return res.data || [];
            }
            return [];
        },
        enabled: Boolean(params && Object.keys(params).length > 0),
        ...options
    });
};

/**
 * Hook to get a single reservation by ID
 */
export const useReservationDetails = (id, options = {}) => {
    return useQuery({
        queryKey: RESERVATION_KEYS.DETAILS(id),
        queryFn: async () => {
            if (!id) return null;
            const res = await reservationService.getReservationById(id);
            return res?.data || res || null;
        },
        enabled: Boolean(id),
        ...options
    });
};

/**
 * Hook to create a reservation
 */
export const useCreateReservation = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => reservationService.createReservation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.ALL });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        ...options
    });
};

/**
 * Hook to update a reservation
 */
export const useUpdateReservation = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => reservationService.updateReservation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.ALL });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        ...options
    });
};

/**
 * Hook to delete a reservation
 */
export const useDeleteReservation = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => reservationService.deleteReservation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.ALL });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        ...options
    });
};

/**
 * Hook to get restaurant slots by auth
 */
export const useSlots = (options = {}) => {
    return useQuery({
        queryKey: RESERVATION_KEYS.SLOTS,
        queryFn: async () => {
            const res = await slotsService.getSlotsByAuth();
            if (!res || res.success === false) {
                throw new Error(res?.message || 'Failed to load restaurant slots');
            }
            return Array.isArray(res.data) ? res.data : [];
        },
        ...options
    });
};

/**
 * Hook to get generated slots (optionally for a specific table)
 */
export const useGeneratedSlots = (tableId = null, options = {}) => {
    return useQuery({
        queryKey: RESERVATION_KEYS.GENERATED_SLOTS(tableId),
        queryFn: async () => {
            const res = await slotsService.getGeneratedSlots(tableId);
            if (res && res.success !== false) {
                return res.data || [];
            }
            return [];
        },
        ...options
    });
};

/**
 * Hook to update slots
 */
export const useUpdateSlots = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => slotsService.updateSlots(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.SLOTS });
            queryClient.invalidateQueries({ queryKey: ['generatedSlots'] });
        },
        ...options
    });
};

/**
 * Hook to create slots
 */
export const useCreateSlots = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => slotsService.createSlots(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.SLOTS });
            queryClient.invalidateQueries({ queryKey: ['generatedSlots'] });
        },
        ...options
    });
};

/**
 * Hook to delete slot
 */
export const useDeleteSlot = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => slotsService.deleteSlot(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.SLOTS });
            queryClient.invalidateQueries({ queryKey: ['generatedSlots'] });
        },
        ...options
    });
};

/**
 * Mutation to search reservations dynamically
 */
export const useSearchReservationsMutation = () => {
    return useMutation({
        mutationFn: (params) => reservationService.searchReservations(params)
    });
};

/**
 * Mutation to get reservation details by id
 */
export const useGetReservationByIdMutation = () => {
    return useMutation({
        mutationFn: (id) => reservationService.getReservationById(id)
    });
};

/**
 * Mutation to get generated slots by table id
 */
export const useGetGeneratedSlotsMutation = () => {
    return useMutation({
        mutationFn: (tableId) => slotsService.getGeneratedSlots(tableId)
    });
};

/**
 * Hook to configure availability / slot generator (POST /restaurant/store_details/save)
 */
export const useSaveAvailability = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => slotsService.saveAvailability(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.SLOTS });
            queryClient.invalidateQueries({ queryKey: ['generatedSlots'] });
        },
        ...options
    });
};
