import { calculateOrderItemsSubtotal } from '../FloorPlan/floorPlanPayment';

const readAmount = (order, fields) => {
    for (const field of fields) {
        const value = order?.[field];
        if (value === null || value === undefined || value === '') continue;
        const amount = Number(value);
        if (Number.isFinite(amount)) return amount;
    }
    return null;
};

const ORDER_TOTAL_FIELDS = [
    'Grand_Total',
    'grand_total',
    'GrandTotal',
    'Total',
    'total',
    'Total_Amount',
    'total_amount',
    'total_price'
];

const hasItemPriceBreakdown = (item) => {
    const hasBasePrice = readAmount(item, ['item_price', 'Item_price', 'itemPrice'])
        !== null
        || readAmount(item?.Item, ['item-price', 'item_price', 'Price', 'prices', 'price'])
        !== null;
    const hasVariantPrice = readAmount(item, ['variant_price', 'variantPrice'])
        !== null
        || readAmount(item?.Variant, ['Item_prices', 'prices', 'price'])
        !== null
        || readAmount(item?.item_Variants_id, ['Item_prices', 'prices', 'price'])
        !== null
        || item?.item_Variants_id == null;
    const hasAddonPrice = readAmount(item, ['addon_price', 'addonPrice'])
        !== null
        || readAmount(item?.Addon, ['Item_prices', 'prices', 'price'])
        !== null
        || readAmount(item?.item_Addons_id, ['Item_prices', 'prices', 'price'])
        !== null
        || item?.item_Addons_id == null;

    return hasBasePrice && hasVariantPrice && hasAddonPrice;
};

export const getOrderTotalsCorrection = (order = {}) => {
    const items = Array.isArray(order.items) ? order.items : [];
    if (items.length === 0 || !items.every((item) =>
        readAmount(item, ['line_total', 'lineTotal', 'unit_price', 'unitPrice']) !== null
        || hasItemPriceBreakdown(item)
    )) {
        return null;
    }

    const subtotal = calculateOrderItemsSubtotal(items);
    const tax = readAmount(order, ['Tax', 'tax', 'tax_amount']);
    if (subtotal <= 0 || tax === null) return null;

    const total = Math.round((subtotal + tax + Number.EPSILON) * 100) / 100;
    const savedSubtotal = readAmount(order, ['SubTotal', 'subtotal', 'sub_total', 'Sub_Total']);
    const savedTotal = readAmount(order, ORDER_TOTAL_FIELDS);
    if (
        savedSubtotal !== null
        && Math.abs(savedSubtotal - subtotal) <= 0.01
        && savedTotal !== null
        && Math.abs(savedTotal - total) <= 0.01
    ) {
        return null;
    }

    return {
        SubTotal: subtotal,
        Tax: tax,
        Total: total,
        Grand_Total: total,
        total_amount: total
    };
};

export const isStoredOrderTotalConsistent = (order, expectedTotal) => {
    const savedTotal = readAmount(order, ORDER_TOTAL_FIELDS);
    return savedTotal !== null && Math.abs(savedTotal - expectedTotal) <= 0.01;
};

export const resolveOrderTotal = (order = {}) => {
    const subtotal = readAmount(order, ['SubTotal', 'subtotal', 'sub_total', 'Sub_Total']);
    const tax = readAmount(order, ['Tax', 'tax', 'tax_amount']);
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsSubtotal = calculateOrderItemsSubtotal(items);
    const savedTotal = readAmount(order, ORDER_TOTAL_FIELDS);
    const hasCompleteItemTotals = items.length > 0 && items.every((item) =>
        readAmount(item, ['line_total', 'lineTotal', 'unit_price', 'unitPrice']) !== null
        || hasItemPriceBreakdown(item)
    );

    if (itemsSubtotal > 0 && hasCompleteItemTotals) {
        const itemTotal = Math.round((itemsSubtotal + (tax || 0) + Number.EPSILON) * 100) / 100;
        const subtotalMatchesItems = subtotal !== null && Math.abs(subtotal - itemsSubtotal) <= 0.01;
        const totalMatchesItems = savedTotal !== null && Math.abs(savedTotal - itemTotal) <= 0.01;
        if ((!subtotalMatchesItems || !totalMatchesItems) && (tax !== null || savedTotal === null)) {
            return itemTotal;
        }
    }

    if (subtotal !== null && subtotal > 0 && tax !== null) {
        return Math.round((subtotal + tax + Number.EPSILON) * 100) / 100;
    }

    const savedTotalIsTaxOnly = savedTotal !== null
        && tax !== null
        && Math.abs(savedTotal - tax) <= 0.01;
    if (itemsSubtotal > 0 && tax !== null && (savedTotal === null || savedTotal <= 0 || savedTotalIsTaxOnly)) {
        return Math.round((itemsSubtotal + tax + Number.EPSILON) * 100) / 100;
    }

    if (savedTotal !== null) return savedTotal;
    if (itemsSubtotal > 0) return itemsSubtotal + (tax || 0);
    if (subtotal !== null) return subtotal + (tax || 0);
    return 0;
};