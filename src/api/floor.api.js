import api from './api';

export const floorApi = {
    getAvailable: () => api.get('/admin/floor/getbyauth'),
    getTablesByFloor: (floorId) => api.get(`/admin/floor/getWithTables/${floorId}`),
    getFloorPlan: (floorId) => api.get(`/master/floor_map_table/getTablebyFloorid/${floorId}`)
};
