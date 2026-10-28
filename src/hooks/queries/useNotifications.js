import { useQuery } from '@tanstack/react-query';
import notificationService from '../../services/notificationService';
import { QUERY_KEYS } from '../../utils/queryKeys';

/**
 * Hook to fetch notifications using TanStack Query
 */
export const useNotifications = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.NOTIFICATIONS],
        queryFn: async () => {
            const response = await notificationService.getNotificationsByAuth();
            if (response && response.success !== false) {
                const list = response.data || [];
                return list.map(notif => ({
                    id: notif.Notifications_id || notif._id,
                    Notifications_id: notif.Notifications_id || notif._id,
                    title: "Notification",
                    message: notif.Notifications || notif.message || '',
                    Notifications: notif.Notifications || notif.message || '',
                    createdAt: notif.CreateAt || notif.createdAt,
                    CreateAt: notif.CreateAt || notif.createdAt,
                    isRead: false,
                    CreateBy: notif.CreateBy || { Name: 'System' },
                    createdBy: notif.CreateBy?.Name || 'System'
                }));
            }
            return [];
        },
        staleTime: 30 * 1000,
        refetchInterval: 60 * 1000,
    });
};
