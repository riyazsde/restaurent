import api from './api';

export const planApi = {
    purchase: (data) => api.post('/restaurant/admin_plan_buy_restaurant/purchase', data),
    renew: (data) => api.post('/restaurant/admin_plan_buy_restaurant/renew', data),
    getPublicPlans: (subscriptionType) => api.get('/admin/admin_plan/public', { params: { Subscription_Type: subscriptionType } }),
    getActiveSubscription: () => api.get('/restaurant/admin_plan_buy_restaurant/getRestaurantSubscriptionPurchased'),
    toggleAutoRenew: (data) => api.patch('/restaurant/admin_plan_buy_restaurant/auto-renew', data),
    changePlan: (data) => api.post('/restaurant/admin_plan_buy_restaurant/change-plan', data),
    getChangePlanStatus: () => api.get('/restaurant/admin_plan_buy_restaurant/change-plan')
};

