import {
    getOrderTotalsCorrection,
    isStoredOrderTotalConsistent,
    resolveOrderTotal
} from './orderTotals';

describe('resolveOrderTotal', () => {
    test('uses subtotal plus tax when the saved total is inconsistent', () => {
        expect(resolveOrderTotal({ SubTotal: 6750, Tax: 337.5, Total: 937.5 })).toBe(7087.5);
    });

    test('falls back to the saved total when subtotal or tax is unavailable', () => {
        expect(resolveOrderTotal({ Total: 937.5 })).toBe(937.5);
    });

    test('does not treat tax as the total when subtotal is zero', () => {
        expect(resolveOrderTotal({
            SubTotal: 0,
            Tax: 113,
            Total: 2363
        })).toBe(2363);
    });

    test('supports saved aggregate total aliases', () => {
        expect(resolveOrderTotal({
            SubTotal: 0,
            Tax: 113,
            Grand_Total: 2363,
            total_amount: 999
        })).toBe(2363);
    });

    test('recalculates from item prices when the saved amount only contains tax', () => {
        expect(resolveOrderTotal({
            SubTotal: 0,
            Tax: 88,
            Total: 88,
            items: [
                { item_Quentry: 1, Item: { prices: 1750 } }
            ]
        })).toBe(1838);
    });

    test('uses the sent item total and tax when saved order totals are stale', () => {
        expect(resolveOrderTotal({
            SubTotal: 800,
            Tax: 300,
            Total: 800,
            items: [
                {
                    item_Quentry: 1,
                    item_price: 3000,
                    variant_price: 3000,
                    addon_price: 0,
                    unit_price: 6000,
                    line_total: 6000
                }
            ]
        })).toBe(6300);
    });

    test('uses the persisted variant price when rebuilding item totals', () => {
        const order = {
            SubTotal: 0,
            Tax: 300,
            Total: 800,
            items: [
                {
                    item_Quentry: 1,
                    Item: { prices: 3000 },
                    item_Variants_id: { Item_prices: 3000 }
                }
            ]
        };

        expect(resolveOrderTotal(order)).toBe(6300);
        expect(getOrderTotalsCorrection(order)).toEqual({
            SubTotal: 6000,
            Tax: 300,
            Total: 6300,
            Grand_Total: 6300,
            total_amount: 6300
        });
        expect(isStoredOrderTotalConsistent(
            { Grand_Total: 6300 },
            6300
        )).toBe(true);
    });
});