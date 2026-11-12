const STRIPE_CHECKOUT_ORIGIN = 'https://checkout.stripe.com';
const STRIPE_ORDER_SESSION_KEY = 'stripe_pos_order_id';

export const getStripeCheckoutUrl = (response) => {
    const candidates = [
        response?.data?.checkout_url,
        response?.checkout_url,
        response?.data?.data?.checkout_url
    ];

    for (const candidate of candidates) {
        if (typeof candidate !== 'string') continue;
        try {
            const url = new URL(candidate);
            if (url.origin === STRIPE_CHECKOUT_ORIGIN && !url.username && !url.password) {
                return url.href;
            }
        } catch {
            continue;
        }
    }

    return null;
};

export const isStripeMinimumAmountError = (error) => {
    const message = error?.response?.data?.message || error?.message || '';
    return /total amount.*at least 50 cents/i.test(message);
};

export const rememberStripeOrderId = (orderId) => {
    if (orderId === undefined || orderId === null || orderId === '') {
        throw new Error('Order ID is required for Stripe Checkout');
    }
    window.sessionStorage.setItem(STRIPE_ORDER_SESSION_KEY, String(orderId));
};

export const getRememberedStripeOrderId = () =>
    window.sessionStorage.getItem(STRIPE_ORDER_SESSION_KEY);

export const clearRememberedStripeOrderId = () =>
    window.sessionStorage.removeItem(STRIPE_ORDER_SESSION_KEY);
