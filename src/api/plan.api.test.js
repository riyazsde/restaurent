jest.mock('./api', () => ({
    get: jest.fn(),
    post: jest.fn()
}));

import api from './api';
import { planApi } from './plan.api';

describe('subscription signup checkout API', () => {
    beforeEach(() => {
        api.get.mockReset();
        api.post.mockReset();
    });

    test('creates checkout using the idempotency header', async () => {
        const payload = {
            businessName: 'Demo Cafe',
            email: 'owner@example.com',
            Admin_Plan_id: 14,
            currency: 'usd'
        };
        api.post.mockResolvedValue({ data: { success: true } });

        await planApi.createSignupCheckout(payload, 'checkout-key');

        expect(api.post).toHaveBeenCalledWith(
            '/restaurant/admin_plan_buy_restaurant/checkout',
            payload,
            { headers: { 'Idempotency-Key': 'checkout-key' } }
        );
    });

    test('checks checkout status with the same idempotency header', async () => {
        api.get.mockResolvedValue({ data: { success: true } });

        await planApi.getSignupCheckoutStatus('checkout/123', 'checkout-key');

        expect(api.get).toHaveBeenCalledWith(
            '/restaurant/admin_plan_buy_restaurant/checkout/checkout%2F123/status',
            { headers: { 'Idempotency-Key': 'checkout-key' } }
        );
    });
});
