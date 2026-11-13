export const getOrderId = (order) =>
    order?.POS_Order_id ?? order?.Order_id ?? order?._id ?? order?.id ?? null;

export const getOrderTableId = (order) => {
    const table = order?.Table_id ?? order?.table_id ?? order?.Table;
    return table?.Table_id ?? table?._id ?? table?.id ?? table ?? null;
};

export const isOrderForTable = (order, tableId) => {
    const orderTableId = getOrderTableId(order);
    return orderTableId == null || String(orderTableId) === String(tableId);
};

export const extractOrder = (response) => {
    const candidates = [
        response?.data?.order,
        response?.data?.currentOrder,
        response?.data?.current_order,
        response?.data,
        response?.order,
        response
    ];

    return candidates.find((candidate) => getOrderId(candidate)) || null;
};

export const getOrderPaymentStatus = (order) => {
    const status = [
        order?.payment_status,
        order?.paymentStatus,
        order?.Payment_Status,
        order?.PaymentStatus
    ].find((value) => value !== undefined && value !== null && String(value).trim() !== '');
    return String(status ?? '').trim().toLowerCase();
};

export const isPaymentVerified = (order) => {
    const status = getOrderPaymentStatus(order);
    return ['success', 'paid', 'completed'].includes(status);
};

export const readOrderAmount = (order, fields) => {
    for (const field of fields) {
        const value = order?.[field];
        if (value !== undefined && value !== null && value !== '') {
            const amount = Number(value);
            if (Number.isFinite(amount)) return amount;
        }
    }
    return null;
};

const readFirstAmount = (...values) => {
    for (const value of values) {
        if (value === undefined || value === null || value === '') continue;
        const amount = Number(value);
        if (Number.isFinite(amount)) return amount;
    }
    return 0;
};

const readOptionalAmount = (...values) => {
    for (const value of values) {
        if (value === undefined || value === null || value === '') continue;
        const amount = Number(value);
        if (Number.isFinite(amount)) return amount;
    }
    return null;
};

export const getOrderItemUnitPrice = (item) => {
    const savedUnitPrice = readOptionalAmount(item?.unit_price, item?.unitPrice);
    if (savedUnitPrice !== null) return savedUnitPrice;

    const basePrice = readFirstAmount(
        item?.item_price,
        item?.Item_price,
        item?.Item?.['item-price'],
        item?.Item?.item_price,
        item?.Item?.Price,
        item?.Item?.prices,
        item?.Item?.price,
        item?.price
    );
    const variantPrice = readFirstAmount(
        item?.variant_price,
        item?.Variant?.Item_prices,
        item?.Variant?.prices,
        item?.Variant?.price,
        item?.item_Variants_id?.Item_prices,
        item?.item_Variants_id?.prices,
        item?.item_Variants_id?.price
    );
    const addonPrice = readFirstAmount(
        item?.addon_price,
        item?.Addon?.Item_prices,
        item?.Addon?.prices,
        item?.Addon?.price,
        item?.item_Addons_id?.Item_prices,
        item?.item_Addons_id?.prices,
        item?.item_Addons_id?.price
    );

    return basePrice + variantPrice + addonPrice;
};

export const calculateOrderItemsSubtotal = (items = []) =>
    Math.round(
        items.reduce((sum, item) => {
            const lineTotal = readOptionalAmount(item?.line_total, item?.lineTotal);
            if (lineTotal !== null) return sum + lineTotal;

            const rawQuantity = item?.item_Quentry ?? item?.quantity;
            const quantity = rawQuantity === undefined || rawQuantity === null || rawQuantity === ''
                ? 1
                : readFirstAmount(rawQuantity);
            return sum + getOrderItemUnitPrice(item) * quantity;
        }, 0) * 100
    ) / 100;

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

export const isOrderTotalConsistent = (order, expectedTotal) => {
    const savedTotal = readOrderAmount(order, ORDER_TOTAL_FIELDS);
    return savedTotal !== null && Math.abs(savedTotal - expectedTotal) <= 0.01;
};

export const getOrderTotal = (order, calculatedTotal = 0) => {
    const savedTotal = readOrderAmount(order, ORDER_TOTAL_FIELDS);
    if (savedTotal === null) return calculatedTotal;
    return calculatedTotal > 0 && !isOrderTotalConsistent(order, calculatedTotal)
        ? calculatedTotal
        : savedTotal;
};

export const getOrderSubtotal = (order, calculatedSubtotal = 0) =>
    readOrderAmount(order, ['SubTotal', 'subtotal', 'sub_total', 'Sub_Total']) ?? calculatedSubtotal;

export const getOrderTax = (order, subtotal, calculatedTax = 0) => {
    const tax = readOrderAmount(order, ['Tax', 'tax', 'tax_amount']);
    if (tax !== null) return tax;

    const orderTotal = readOrderAmount(order, ORDER_TOTAL_FIELDS);
    return orderTotal === null || subtotal === 0 ? calculatedTax : orderTotal - subtotal;
};

export const calculateTaxForUpdatedSubtotal = (order, currentSubtotal, nextSubtotal) => {
    const taxRate = readOrderAmount(order, ['Tax_Rate', 'TaxRate', 'tax_rate', 'taxRate']);
    const currentTax = readOrderAmount(order, ['Tax', 'tax', 'tax_amount']);
    const effectiveRate = taxRate ?? (
        currentSubtotal > 0 && currentTax !== null ? (currentTax / currentSubtotal) * 100 : 0
    );

    return Math.round((nextSubtotal * (effectiveRate / 100) + Number.EPSILON) * 100) / 100;
};

export const createVerifiedReceipt = (order, paymentMethod) => {
    if (!getOrderId(order) || !isPaymentVerified(order) || !Array.isArray(order.items) || order.items.length === 0) {
        return null;
    }

    const subTotal = getOrderSubtotal(order, calculateOrderItemsSubtotal(order.items));
    const tax = getOrderTax(order, subTotal);

    return {
        orderTotal: getOrderTotal(order, subTotal + tax),
        subTotal,
        tax,
        customerName: order.Customer?.Name || order.customer_name || '',
        paymentMethod: paymentMethod || order.payment_method || order.paymentMethod || '',
        Order_id: getOrderId(order),
        CreateAt: order.CreateAt || order.createdAt || order.created_at || null
    };
};
