import { buildPosOrderPayload, calculateCartTotals } from './posHelpers';

describe('POS bill and checkout amounts', () => {
    const cartItems = [{
        item_id: 12,
        item_Quentry: 2,
        itemDetails: { Price: 10.25 },
        variantDetails: { Item_prices: 1.5 },
        addonDetails: { Item_prices: 0.75 }
    }];

    test('calculates item, tax, and bill totals without dropping cents', () => {
        expect(calculateCartTotals(cartItems, 10)).toEqual({
            subTotal: 25,
            taxRate: 10,
            taxAmount: 2.5,
            total: 27.5
        });
    });

    test('sends the same selected-item prices and tax used by the bill total', () => {
        const payload = buildPosOrderPayload({
            cartItems,
            selectedCustomer: { Customer_id: 3 },
            diningOption: 'Take Away',
            kitchenId: 1,
            taxAmount: 2.5
        });

        expect(payload.items[0]).toMatchObject({
            item_price: 10.25,
            variant_price: 1.5,
            addon_price: 0.75,
            unit_price: 12.5,
            line_total: 25,
            item_Quentry: 2
        });
        expect(payload.SubTotal).toBe(25);
        expect(payload.Tax).toBe(2.5);
        expect(payload.Total).toBe(27.5);
        expect(payload.Grand_Total).toBe(27.5);
        expect(payload.total_amount).toBe(27.5);
        expect(
            (payload.items[0].item_price + payload.items[0].variant_price + payload.items[0].addon_price) *
            payload.items[0].item_Quentry + payload.Tax
        ).toBe(27.5);
    });

    test('calculates the full POS amount due from base, variant, add-on, and configured tax', () => {
        const orderItems = [{
            item_id: 24,
            item_Quentry: 1,
            itemDetails: { Price: 2500 },
            variantDetails: { Item_prices: 2500 },
            addonDetails: { Item_prices: 2500 }
        }];

        expect(calculateCartTotals(orderItems, 5)).toEqual({
            subTotal: 7500,
            taxRate: 5,
            taxAmount: 375,
            total: 7875
        });
        const screenshotOrderItems = [{
            item_id: 25,
            item_Quentry: 1,
            itemDetails: { Price: 3000 },
            addonDetails: { Item_prices: 3000 }
        }];
        const orderPayload = buildPosOrderPayload({
            cartItems: screenshotOrderItems,
            selectedCustomer: { Customer_id: 3 },
            diningOption: 'Dine in',
            selectedTable: { Table_id: 9 },
            kitchenId: 1,
            taxAmount: 300
        });

        expect(orderPayload.items[0]).toMatchObject({
            item_price: 3000,
            addon_price: 3000,
            unit_price: 6000,
            line_total: 6000
        });
        expect(orderPayload).toMatchObject({
            SubTotal: 6000,
            Tax: 300,
            Total: 6300,
            Grand_Total: 6300,
            total_amount: 6300
        });
    });

    test('rounds each line and the saved order total to the configured currency precision', () => {
        const fractionalCart = [{
            item_id: 18,
            item_Quentry: 2,
            itemDetails: { Price: 10.25 }
        }];

        expect(calculateCartTotals(fractionalCart, 10, 'XOF')).toEqual({
            subTotal: 20,
            taxRate: 10,
            taxAmount: 2,
            total: 22
        });

        const payload = buildPosOrderPayload({
            cartItems: fractionalCart,
            selectedCustomer: { Customer_id: 3 },
            diningOption: 'Take Away',
            taxAmount: 2,
            currency: 'XOF'
        });

        expect(payload).toMatchObject({
            SubTotal: 20,
            Tax: 2,
            Total: 22,
            Grand_Total: 22,
            total_amount: 22,
            items: [{ unit_price: 10, line_total: 20 }]
        });
    });
});
