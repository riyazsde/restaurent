import {
    extractOrder,
    createVerifiedReceipt,
    getOrderId,
    getOrderTotal,
    isPaymentVerified,
    isOrderForTable,
    getOrderItemUnitPrice,
    calculateOrderItemsSubtotal,
    getOrderSubtotal,
    getOrderTax,
    calculateTaxForUpdatedSubtotal,
    isOrderTotalConsistent
} from './floorPlanPayment';

describe('Floor Plan payment state helpers', () => {
    test('does not treat an empty response as an order', () => {
        expect(extractOrder({ success: true, data: null })).toBeNull();
        expect(extractOrder({ success: true, data: { items: [] } })).toBeNull();
    });

    test('extracts an order from common API response envelopes', () => {
        const order = { POS_Order_id: 1031, payment_status: 'Pending' };
        expect(extractOrder({ data: { order } })).toBe(order);
        expect(getOrderId(order)).toBe(1031);
    });

    test('does not associate an order from a different table with the selected table', () => {
        expect(isOrderForTable({ Table_id: 1031 }, 1031)).toBe(true);
        expect(isOrderForTable({ Table_id: { Table_id: 1032 } }, 1031)).toBe(false);
    });

    test('considers only an explicit paid status verified', () => {
        expect(isPaymentVerified({ Order_Status: 'Completed' })).toBe(false);
        expect(isPaymentVerified({ payment_status: 'Pending' })).toBe(false);
        expect(isPaymentVerified({ paymentStatus: 'Success' })).toBe(true);
    });

    test('does not invent a total when an order is absent', () => {
        expect(getOrderTotal(null, 0)).toBe(0);
        expect(getOrderTotal({ Total: 3750 }, 0)).toBe(3750);
    });

    test('adds base, variant, and add-on prices and applies quantity to the full unit price', () => {
        const items = [{
            item_Quentry: 2,
            item_price: 10.25,
            Variant: { prices: 1.5 },
            Addon: { Item_prices: 0.75 }
        }];

        expect(getOrderItemUnitPrice(items[0])).toBe(12.5);
        expect(calculateOrderItemsSubtotal(items)).toBe(25);
    });

    test('keeps bill subtotal, tax, and checkout total reconciled to stored order values', () => {
        const order = { SubTotal: 100, Grand_Total: 115, items: [] };
        const subtotal = getOrderSubtotal(order, 80);

        expect(subtotal).toBe(100);
        expect(getOrderTax(order, subtotal)).toBe(15);
        expect(getOrderTotal(order, subtotal + getOrderTax(order, subtotal))).toBe(115);
    });

    test('uses the bill total instead of an inconsistent persisted amount', () => {
        const order = { SubTotal: 6000, Tax: 300, Grand_Total: 975 };

        expect(getOrderTotal(order, 6300)).toBe(6300);
        expect(isOrderTotalConsistent(order, 6300)).toBe(false);
    });

    test('recalculates tax for quantity changes using the order tax rate', () => {
        expect(calculateTaxForUpdatedSubtotal({ Tax_Rate: 10 }, 100, 150)).toBe(15);
        expect(calculateTaxForUpdatedSubtotal({ SubTotal: 100, Tax: 12 }, 100, 150)).toBe(18);
    });

    test('creates a receipt only for a verified payment on an identified order', () => {
        expect(createVerifiedReceipt({ Total: 100, payment_status: 'Pending' })).toBeNull();
        expect(createVerifiedReceipt({ payment_status: 'Success' })).toBeNull();
        expect(createVerifiedReceipt({
            POS_Order_id: 1031,
            Total: 3750,
            payment_status: 'Success',
            items: []
        })).toBeNull();
        expect(createVerifiedReceipt({
            POS_Order_id: 1031,
            Total: 3750,
            payment_status: 'Success',
            items: [{ item_id: 1 }],
            Customer: { Name: 'QA T1031' }
        })).toMatchObject({
            orderTotal: 3750,
            Order_id: 1031,
            customerName: 'QA T1031'
        });
    });
});
