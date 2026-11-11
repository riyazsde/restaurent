import { resolveOrderTotal } from './orderTotals';

describe('resolveOrderTotal', () => {
    test('uses subtotal plus tax when the saved total is inconsistent', () => {
        expect(resolveOrderTotal({ SubTotal: 6750, Tax: 337.5, Total: 937.5 })).toBe(7087.5);
    });

    test('falls back to the saved total when subtotal or tax is unavailable', () => {
        expect(resolveOrderTotal({ Total: 937.5 })).toBe(937.5);
    });
});