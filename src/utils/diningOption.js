export const normalizeDiningOption = (diningOption) => {
    const normalized = String(diningOption ?? '').trim().toLowerCase().replace(/[\s_-]+/g, ' ');

    switch (normalized) {
        case 'dine in':
            return 'Dine in';
        case 'delivery':
            return 'Delivery';
        case 'take away':
        case 'takeaway':
            return 'Take Away';
        default:
            return diningOption;
    }
};
