const STATUS_KEYS = {
    preparing: 'preparing',
    inpreparation: 'preparing',
    inprogress: 'inProgress',
    cooking: 'cooking',
    inkitchen: 'inKitchen',
    ready: 'ready',
    served: 'served',
    completed: 'completed',
    complete: 'completed',
    cancelled: 'cancelled',
    canceled: 'cancelled',
    pending: 'pending',
    new: 'new',
    open: 'new',
    processing: 'processing',
    onhold: 'onHold',
    hold: 'onHold',
    failed: 'failed',
    rejected: 'rejected',
    refunded: 'refunded',
    paid: 'paid',
    success: 'success'
};

export const getOrderStatusKey = (status) => {
    const normalized = String(status ?? '')
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, '');

    return STATUS_KEYS[normalized] || 'other';
};

export const getPaymentStatusKey = (status) => {
    const key = getOrderStatusKey(status);
    return key;
};

export const canMarkOrderReady = (status) =>
    !['cancelled', 'ready', 'served', 'completed'].includes(getOrderStatusKey(status));
