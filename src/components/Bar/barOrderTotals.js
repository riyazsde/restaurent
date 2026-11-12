import { roundCurrencyAmount } from '../../utils/currencyUtils';

export const BAR_SERVICE_CHARGE = 200;

export const calculateBarOrderTotals = (cartItems = [], taxRate = 0.06, currency) => {
    const itemsTotal = cartItems.reduce((total, item) => {
        const quantity = Number(item?.quantity) || 1;
        const lineTotal = roundCurrencyAmount((Number(item?.price) || 0) * quantity, currency);
        return total + lineTotal;
    }, 0);
    const roundedItemsTotal = roundCurrencyAmount(itemsTotal, currency);
    const taxAmount = roundCurrencyAmount(roundedItemsTotal * taxRate, currency);
    const serviceCharge = cartItems.length > 0
        ? roundCurrencyAmount(BAR_SERVICE_CHARGE, currency)
        : 0;

    return {
        itemsTotal: roundedItemsTotal,
        taxAmount,
        serviceCharge,
        grandTotal: roundCurrencyAmount(roundedItemsTotal + taxAmount + serviceCharge, currency)
    };
};
