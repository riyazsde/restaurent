import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import floorService from '../../services/floorService';
import floorMapService from '../../services/floorMapService';
import posService from '../../services/posService';
import { FLOOR_KEYS, POS_KEYS } from '../../utils/queryKeys';

export const useFloors = () => {
  return useQuery({
    queryKey: [FLOOR_KEYS.FLOORS],
    queryFn: async () => {
      const response = await floorService.getFloorsByAuth();
      if (response && response.success) {
        return response.data || [];
      }
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFloorMap = (floorId) => {
  return useQuery({
    queryKey: [FLOOR_KEYS.FLOOR_MAP, floorId],
    queryFn: async () => {
      if (!floorId) return {};
      const response = await floorMapService.getTableByFloorId(floorId);
      if (response && response.success) {
        return response.data || {};
      }
      return {};
    },
    enabled: !!floorId,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes, refetched on invalidation
  });
};

export const useAllFloorMaps = () => {
  return useQuery({
    queryKey: [FLOOR_KEYS.ALL_FLOOR_MAPS],
    queryFn: async () => {
      const response = await floorMapService.getAllFloorMaps();
      if (response && response.success) {
        return response.data || [];
      }
      return [];
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateFloor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (floorData) => {
      const res = await floorService.createFloor(floorData);
      if (res && res.success === false) throw new Error(res.message || 'Failed to create floor');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.FLOORS] });
      queryClient.invalidateQueries({ queryKey: [POS_KEYS.MAPPED_TABLES] });
    }
  });
};

export const useUpdateFloor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (floorData) => {
      const res = await floorService.updateFloor(floorData);
      if (res && res.success === false) throw new Error(res.message || 'Failed to update floor');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.FLOORS] });
      queryClient.invalidateQueries({ queryKey: [POS_KEYS.MAPPED_TABLES] });
    }
  });
};

export const useDeleteFloor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await floorService.deleteFloor(id);
      if (res && res.success === false) throw new Error(res.message || 'Failed to delete floor');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.FLOORS] });
      queryClient.invalidateQueries({ queryKey: [POS_KEYS.MAPPED_TABLES] });
    }
  });
};

export const useCreateFloorMap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await floorMapService.createFloorMap(payload);
      if (res && res.success === false) throw new Error(res.message || 'Failed to map table');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.ALL_FLOOR_MAPS] });
      queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.FLOOR_MAP] });
      queryClient.invalidateQueries({ queryKey: [POS_KEYS.MAPPED_TABLES] });
    }
  });
};

export const useUpdateFloorMap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await floorMapService.updateFloorMap(payload);
      if (res && res.success === false) throw new Error(res.message || 'Failed to update table map');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.ALL_FLOOR_MAPS] });
      queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.FLOOR_MAP] });
      queryClient.invalidateQueries({ queryKey: [POS_KEYS.MAPPED_TABLES] });
    }
  });
};

export const useDeleteFloorMap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await floorMapService.deleteFloorMap(id);
      if (res && res.success === false) throw new Error(res.message || 'Failed to remove table map');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.ALL_FLOOR_MAPS] });
      queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.FLOOR_MAP] });
      queryClient.invalidateQueries({ queryKey: [POS_KEYS.MAPPED_TABLES] });
    }
  });
};

export const useFloorById = (floorId) => {
  return useQuery({
    queryKey: [FLOOR_KEYS.FLOOR_DETAIL, floorId],
    queryFn: async () => {
      if (!floorId) return null;
      const response = await floorService.getFloorById(floorId);
      if (response && response.success) {
        return response.data || null;
      }
      return response || null;
    },
    enabled: !!floorId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFloorWithTables = (floorId) => {
  return useQuery({
    queryKey: [FLOOR_KEYS.FLOOR_WITH_TABLES, floorId],
    queryFn: async () => {
      if (!floorId) return null;
      const response = await floorService.getFloorWithTables(floorId);
      if (response && response.success) {
        return response.data || null;
      }
      return response || null;
    },
    enabled: !!floorId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useWaitlist = (status = 'Waiting', enabled = true) => {
  return useQuery({
    queryKey: [FLOOR_KEYS.WAITLIST, status],
    queryFn: async () => {
      const response = await floorService.getWaitlist(status);
      if (response && response.success) {
        return Array.isArray(response.data) ? response.data : (response.data?.waitlist || []);
      }
      return Array.isArray(response) ? response : [];
    },
    enabled,
    refetchInterval: 20000,
  });
};

export const useNotifyWaitlistUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, channel = 'SMS', delivery_reference }) => {
      const res = await floorService.notifyWaitlistUser(id, {
        channel,
        delivery_reference: delivery_reference || `MSG-${Date.now()}`
      });
      if (res && res.success === false) throw new Error(res.message || 'Failed to notify guest');
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FLOOR_KEYS.WAITLIST] });
    }
  });
};

export const useTableCurrentOrder = (tableId) => {
  return useQuery({
    queryKey: ['tableCurrentOrder', tableId],
    queryFn: async () => {
      if (!tableId) return null;
      const res = await posService.getCurrentOrder(tableId);
      if (res && res.success) {
        return res.data;
      }
      return null;
    },
    enabled: !!tableId,
  });
};

export const useOrderPdf = () => {
  return useMutation({
    mutationFn: async (orderId) => {
      if (!orderId) throw new Error('Order ID is required');
      return await posService.getOrderPdf(orderId);
    }
  });
};
