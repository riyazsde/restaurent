import api from './api';

export const employeeSettingsApi = {
    getWorkSummary: () => api.get('/employee/settings/work-summary'),
    getProfile: () => api.get('/employee/settings/profile'),
    updateProfile: (data) => api.put('/employee/settings/profile', data),
    changePassword: (data) => api.put('/employee/settings/change-password', data),
    getNotifications: (params) => api.get('/employee/settings/notifications', { params }),
    markNotificationRead: (mapId) => api.patch(`/employee/settings/notifications/${mapId}/read`)
};
