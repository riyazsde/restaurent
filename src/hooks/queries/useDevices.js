import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import deviceService from '../../services/deviceService';

export const DEVICE_KEYS = {
    MY_DEVICES: ['myDevices'],
};

/**
 * Hook to fetch devices by auth
 */
export const useDevices = (options = {}) => {
    return useQuery({
        queryKey: DEVICE_KEYS.MY_DEVICES,
        queryFn: async () => {
            const response = await deviceService.getDevicesByAuth();
            if (response && response.success !== false) {
                return response.data || [];
            }
            return [];
        },
        ...options
    });
};

/**
 * Hook to register a physical terminal (POST /master/myDevices/create)
 */
export const useCreateDevice = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (deviceData) => deviceService.createDevice(deviceData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DEVICE_KEYS.MY_DEVICES });
        },
        ...options
    });
};

/**
 * Hook to rotate bridge token (POST /master/myDevices/:deviceId/bridge/rotate-token)
 */
export const useRotateBridgeToken = (options = {}) => {
    return useMutation({
        mutationFn: (deviceId) => deviceService.rotateBridgeToken(deviceId),
        ...options
    });
};

/**
 * Hook to delete a device
 */
export const useDeleteDevice = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deviceService.deleteDevice(id),
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData(DEVICE_KEYS.MY_DEVICES, (old) =>
                Array.isArray(old)
                    ? old.filter((d) => String(d?.MyDevices_id ?? d?.My_devices_id ?? d?.id ?? d?._id) !== String(deletedId))
                    : []
            );
            queryClient.invalidateQueries({ queryKey: DEVICE_KEYS.MY_DEVICES });
        },
        ...options
    });
};

/**
 * Hook to lock a device (POST /master/myDevices/:id/lock)
 */
export const useLockDevice = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ deviceId, reason }) => deviceService.lockDevice(deviceId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DEVICE_KEYS.MY_DEVICES });
        },
        ...options
    });
};

/**
 * Hook to restart a device (POST /master/myDevices/:id/restart)
 */
export const useRestartDevice = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ deviceId, ...restartOptions }) => deviceService.restartDevice(deviceId, restartOptions),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DEVICE_KEYS.MY_DEVICES });
        },
        ...options
    });
};

/**
 * Hook to push app update to a device (POST /master/myDevices/:id/push-update)
 */
export const usePushUpdate = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ deviceId, appVersion }) => deviceService.pushUpdate(deviceId, appVersion),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DEVICE_KEYS.MY_DEVICES });
        },
        ...options
    });
};

/**
 * Hook to fetch session logs of a device (GET /master/myDevices/:id/session-logs)
 */
export const useDeviceSessionLogs = (deviceId, options = {}) => {
    return useQuery({
        queryKey: ['deviceSessionLogs', deviceId],
        queryFn: async () => {
            if (!deviceId) return [];
            const res = await deviceService.getSessionLogs(deviceId);
            return res?.data || res || [];
        },
        enabled: Boolean(deviceId),
        ...options
    });
};

