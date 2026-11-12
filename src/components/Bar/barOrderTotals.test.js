import { calculateBarOrderTotals } from './barOrderTotals';

describe('Bar order totals', () => {
    test('includes service charge in the amount due', () => {
        expect(calculateBarOrderTotals([
            { price: 3250, quantity: 1 }
        ], 0.06, 'XOF')).toEqual({
            itemsTotal: 3250,
            taxAmount: 195,
            serviceCharge: 200,
            grandTotal: 3645
        });
    });

    test('does not add a service charge to an empty cart', () => {
        expect(calculateBarOrderTotals([], 0.06, 'XOF')).toEqual({
            itemsTotal: 0,
            taxAmount: 0,
            serviceCharge: 0,
            grandTotal: 0
        });
    });
});
