export const SUBSCRIPTION_CHECKOUT_STORAGE_KEY = 'restaurant_subscription_checkout';

export const createCheckoutIdempotencyKey = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();

    if (!window.crypto?.getRandomValues) {
        throw new Error('Secure random number generation is unavailable');
    }

    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const saveSubscriptionCheckout = (checkout) => {
    window.sessionStorage.setItem(SUBSCRIPTION_CHECKOUT_STORAGE_KEY, JSON.stringify(checkout));
};

export const getSubscriptionCheckout = () => {
    const storedCheckout = window.sessionStorage.getItem(SUBSCRIPTION_CHECKOUT_STORAGE_KEY);
    return storedCheckout ? JSON.parse(storedCheckout) : null;
};

export const clearSubscriptionCheckout = () => {
    window.sessionStorage.removeItem(SUBSCRIPTION_CHECKOUT_STORAGE_KEY);
};
