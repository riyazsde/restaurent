import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import posService from '../../services/posService';
import { QUERY_KEYS } from '../../utils/queryKeys';

export const useKitchenOrders = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.KITCHEN_ORDERS, 'kitchen', params],
    queryFn: async () => {
      const response = await posService.getMyOrders(params);
      if (response && response.success !== false) {
        return Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
      }
      return [];
    },
    refetchInterval: 15000,
    staleTime: 5000,
  });
};

export const useKitchenDisplayOrders = (filter = 'today') => {
  return useQuery({
    queryKey: [QUERY_KEYS.KITCHEN_ORDERS, 'display', filter],
    queryFn: async () => {
      const response = await posService.getKitchenDisplayOrders(filter);
      if (response && response.success !== false) {
        return Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
      }
      return [];
    },
    refetchInterval: 15000,
    staleTime: 5000,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateData) => posService.updateOrderStatus(updateData),
    onMutate: async (updateData) => {
      const orderId = updateData?.POS_Order_id ?? updateData?.id ?? updateData?.order_id;
      const targetStatus = updateData?.Order_Status ?? updateData?.status ?? 'Ready';

      // Cancel ongoing refetches to prevent overwriting optimistic state
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.KITCHEN_ORDERS] });

      // Snapshot previous query data across all kitchen order queries
      const previousDataQueries = queryClient.getQueriesData({ queryKey: [QUERY_KEYS.KITCHEN_ORDERS] });

      // Optimistically update matching kitchen order in all cache instances
      queryClient.setQueriesData({ queryKey: [QUERY_KEYS.KITCHEN_ORDERS] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((order) => {
          const id = order?.POS_Order_id ?? order?.id ?? order?._id;
          if (String(id) === String(orderId)) {
            const updatedItems = Array.isArray(order.items)
              ? order.items.map((item) => ({
                  ...item,
                  item_status: targetStatus === 'Ready' ? 'Ready' : item.item_status
                }))
              : order.items;
            return {
              ...order,
              Order_Status: targetStatus,
              status: targetStatus,
              items: updatedItems
            };
          }
          return order;
        });
      });

      return { previousDataQueries };
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      if (context?.previousDataQueries) {
        context.previousDataQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KITCHEN_ORDERS] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen_orders'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: ['pos_orders'] });
    },
  });
};

export const useUpdateItemStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateData) => posService.updateItemStatus(updateData),
    onMutate: async (updateData) => {
      const orderId = updateData?.POS_Order_id ?? updateData?.id;
      const itemId = updateData?.item_id;
      const targetStatus = updateData?.item_status ?? 'Ready';

      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.KITCHEN_ORDERS] });
      const previousDataQueries = queryClient.getQueriesData({ queryKey: [QUERY_KEYS.KITCHEN_ORDERS] });

      queryClient.setQueriesData({ queryKey: [QUERY_KEYS.KITCHEN_ORDERS] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((order) => {
          const id = order?.POS_Order_id ?? order?.id ?? order?._id;
          if (String(id) === String(orderId)) {
            const updatedItems = Array.isArray(order.items)
              ? order.items.map((item) => {
                  const itmId = item.item_id ?? item.Item?.Items_id ?? item.Item?.item_id;
                  if (String(itmId) === String(itemId)) {
                    return { ...item, item_status: targetStatus };
                  }
                  return item;
                })
              : order.items;
            return { ...order, items: updatedItems };
          }
          return order;
        });
      });

      return { previousDataQueries };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousDataQueries) {
        context.previousDataQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KITCHEN_ORDERS] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen_orders'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: ['pos_orders'] });
    },
  });
};

export const useSendToKitchen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => posService.sendToKitchen(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KITCHEN_ORDERS] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen_orders'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: ['pos_orders'] });
    },
  });
};

export const useDeleteOrderItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemId }) => posService.deleteOrderItem(orderId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.KITCHEN_ORDERS] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen_orders'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: ['pos_orders'] });
    },
  });
};

export const useKitchenStations = () => {
  return useQuery({
    queryKey: ['kitchen_stations'],
    queryFn: async () => {
      const kitchenService = (await import('../../services/kitchenService')).default;
      const res = await kitchenService.getKitchenByAuth();
      if (res && res.success !== false) {
        return Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      }
      return [];
    }
  });
};

export const useCreateKitchen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const kitchenService = (await import('../../services/kitchenService')).default;
      return await kitchenService.createKitchen(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen_stations'] });
    }
  });
};

export const useUpdateKitchen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const kitchenService = (await import('../../services/kitchenService')).default;
      return await kitchenService.updateKitchen(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen_stations'] });
    }
  });
};

export const useDeleteKitchen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const kitchenService = (await import('../../services/kitchenService')).default;
      return await kitchenService.deleteKitchen(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen_stations'] });
    }
  });
};
