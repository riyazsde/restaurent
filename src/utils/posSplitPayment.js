export const validateCashSplitPayments = (payments, orderTotal) => {
    if (!Number.isSafeInteger(orderTotal) || orderTotal <= 0) return 'invalidTotal';
    if (!Array.isArray(payments) || payments.length < 2 || payments.length > 100) return 'invalidCount';

    let total = 0;
    for (const payment of payments) {
        const amount = Number(payment?.amount);
        if (!String(payment?.payer ?? '').trim() || !Number.isSafeInteger(amount) || amount <= 0) {
            return 'invalidEntry';
        }
        total += amount;
        if (!Number.isSafeInteger(total)) return 'invalidEntry';
    }

    return total === orderTotal ? null : 'totalMismatch';
};
