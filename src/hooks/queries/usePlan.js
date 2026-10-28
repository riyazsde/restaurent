import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planApi } from '../../api/plan.api';
import restaurantService from '../../services/restaurantService';

export const PLAN_KEYS = {
    ACTIVE_SUBSCRIPTION: ['activeSubscription'],
    PUBLIC_PLANS: (type) => ['publicPlans', type],
    CHANGE_PLAN_STATUS: ['changePlanStatus'],
};

/**
 * Hook to get the active restaurant subscription
 */
export const useActiveSubscription = (options = {}) => {
    return useQuery({
        queryKey: PLAN_KEYS.ACTIVE_SUBSCRIPTION,
        queryFn: async () => {
            const res = await planApi.getActiveSubscription();
            return res?.data || res || null;
        },
        retry: false,
        ...options
    });
};

/**
 * Hook to get public subscription plans (e.g., 'SaaS Only', 'SaaS + Hardware')
 */
export const usePublicPlans = (subscriptionType, options = {}) => {
    return useQuery({
        queryKey: PLAN_KEYS.PUBLIC_PLANS(subscriptionType),
        queryFn: async () => {
            const res = await planApi.getPublicPlans(subscriptionType);
            return res?.data || res || [];
        },
        ...options
    });
};

/**
 * Hook to toggle subscription auto-renew
 */
export const useToggleAutoRenew = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => planApi.toggleAutoRenew(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PLAN_KEYS.ACTIVE_SUBSCRIPTION });
        },
        ...options
    });
};

/**
 * Hook to purchase a plan
 */
export const usePurchasePlan = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => planApi.purchase(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PLAN_KEYS.ACTIVE_SUBSCRIPTION });
        },
        ...options
    });
};

/**
 * Hook to renew a plan
 */
export const useRenewPlan = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => planApi.renew(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PLAN_KEYS.ACTIVE_SUBSCRIPTION });
        },
        ...options
    });
};

/**
 * Hook to change plan
 */
export const useChangePlan = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => planApi.changePlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PLAN_KEYS.ACTIVE_SUBSCRIPTION });
        },
        ...options
    });
};

/**
 * Hook to create public subscription payment from website
 */
export const useCreatePublicSubscriptionPayment = (options = {}) => {
    return useMutation({
        mutationFn: (data) => restaurantService.createPublicSubscriptionPayment(data),
        ...options
    });
};

