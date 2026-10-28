import api from './api';

export const shiftsApi = {
    getDashboard: () => api.get('/employee/shifts/dashboard'),
    requestSwap: (data) => api.post('/employee/shifts/swap', data),
    respondSwap: (swapId, data) => api.patch(`/employee/shifts/swap/${swapId}/respond`, data),
    scheduleShift: (data) => api.post('/employee/shifts/schedule', data)
};
