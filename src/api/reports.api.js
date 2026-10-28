import api from './api';

export const reportsApi = {
    getPerformance: (params) => api.get('/restaurant/reports/getRestaurantPerformance', { params }),
    getDashboard: (params) => api.get('/restaurant/reports/restaurant-dashboard', { params }),
    getAllTimeTop: () => api.get('/restaurant/reports/dashboard'),
    getEmployeePerformance: (employeeId) => api.get(`/restaurant/reports/employee-performance/${employeeId}`)
};
