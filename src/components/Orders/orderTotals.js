export const resolveOrderTotal = (order = {}) => {
    const subtotal = Number(order.SubTotal);
    const tax = Number(order.Tax);

    if (
        order.SubTotal !== null && order.SubTotal !== undefined &&
        order.Tax !== null && order.Tax !== undefined &&
        Number.isFinite(subtotal) && Number.isFinite(tax)
    ) {
        return Math.round((subtotal + tax + Number.EPSILON) * 100) / 100;
    }

    const total = Number(order.Total);
    return Number.isFinite(total) ? total : 0;
};