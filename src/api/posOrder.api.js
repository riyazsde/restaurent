import api from './api';

export const posOrderApi = {
    create: (data) => api.post('/restaurant/pos_order/create', data),
    updateCart: (data) => api.put('/restaurant/pos_order/update', data),
    sendToKitchen: (data) => api.patch('/restaurant/pos_order/send-to-kitchen', data),
    getAll: (params) => api.get('/restaurant/pos_order/getall', { params }),
    updateItemStatus: (data) => api.patch('/restaurant/pos_order/update-item-status', data),
    updateStatus: async (data) => {
        const orderId = data?.id ?? data?.POS_Order_id ?? data?.order_id ?? data?.Order_id;
        const numericId = orderId !== undefined && orderId !== null ? (isNaN(Number(orderId)) ? orderId : Number(orderId)) : undefined;
        let statusVal = data?.Order_Status ?? data?.status;
        if (statusVal === 'Accepted' || !statusVal) statusVal = 'Preparing';
        const payload = {
            ...data,
            id: numericId,
            POS_Order_id: numericId,
            Order_Status: statusVal
        };
        try {
            return await api.put('/restaurant/pos_order/update-status', payload);
        } catch (err) {
            return await api.patch('/restaurant/pos_order/update-status', payload);
        }
    },
    deleteItem: (orderId, itemId) => api.delete(`/restaurant/pos_order/delete-item/${orderId}/${itemId}`),
    printBill: (orderId) => api.get(`/restaurant/pos_order/getbyid/${orderId}/pdf`),
    createCustomer: (data) => api.post('/restaurant/customer/create', data),
    updateCustomer: (data) => api.put('/restaurant/customer/update', data)
};
