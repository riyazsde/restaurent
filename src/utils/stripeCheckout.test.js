import {
    clearRememberedStripeOrderId,
    getRememberedStripeOrderId,
    getStripeCheckoutUrl,
    isStripeMinimumAmountError,
    rememberStripeOrderId
} from './stripeCheckout';

describe('Stripe Checkout helpers', () => {
    it('reads the documented checkout_url response', () => {
        expect(getStripeCheckoutUrl({
            success: true,
            data: { checkout_url: 'https://checkout.stripe.com/c/pay/cs_test_123' }
        })).toBe('https://checkout.stripe.com/c/pay/cs_test_123');
    });

    it('rejects non-Stripe or insecure checkout URLs', () => {
        expect(getStripeCheckoutUrl({ data: { checkout_url: 'http://checkout.stripe.com/pay' } })).toBeNull();
        expect(getStripeCheckoutUrl({ data: { checkout_url: 'https://example.com/pay' } })).toBeNull();
    });

    it('recognizes Stripe minimum charge errors from the API', () => {
        expect(isStripeMinimumAmountError({
            response: {
                data: {
                    message: "The Checkout Session's total amount must convert to at least 50 cents. 88 Fr converts to approximately $0.15."
                }
            }
        })).toBe(true);
        expect(isStripeMinimumAmountError({
            response: { data: { message: 'Order not found' } }
        })).toBe(false);
    });

    it('stores the active order ID for the configured return route', () => {
        rememberStripeOrderId(123);
        expect(getRememberedStripeOrderId()).toBe('123');
        clearRememberedStripeOrderId();
        expect(getRememberedStripeOrderId()).toBeNull();
    });
});
