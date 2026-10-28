import api from './api';

export const attendanceApi = {
    getDashboard: () => api.get('/employee/attendance/dashboard'),
    clockIn: (data) => api.post('/employee/attendance/clock-in', data),
    clockOut: (data) => api.post('/employee/attendance/clock-out', data),
    startBreak: (data) => api.post('/employee/attendance/break/start', data),
    endBreak: (data) => api.post('/employee/attendance/break/end', data),
    getHistory: (params) => api.get('/employee/attendance/history', { params }),
    applyLeave: (data) => api.post('/employee/attendance/leave', data),
    getLeaveStatus: (params) => api.get('/employee/attendance/leave', { params }),
    cancelLeave: (leaveId) => api.patch(`/employee/attendance/leave/${leaveId}/cancel`),
    reviewLeave: (leaveId, data) => api.patch(`/employee/attendance/leave/${leaveId}/review`, data),
    updateEmergencyContact: (data) => api.put('/employee/attendance/emergency-contact', data)
};
