import { validateCashSplitPayments } from './posSplitPayment';

describe('validateCashSplitPayments', () => {
    it('accepts named positive integer shares that exactly equal the order total', () => {
        expect(validateCashSplitPayments([
            { payer: 'Alice', amount: '5000' },
            { payer: 'Bob', amount: '7000' }
        ], 12000)).toBeNull();
    });

    it('rejects invalid names, amounts, counts, and non-exact totals', () => {
        expect(validateCashSplitPayments([{ payer: 'Alice', amount: 12000 }], 12000)).toBe('invalidCount');
        expect(validateCashSplitPayments(Array(101).fill({ payer: 'Payer', amount: 1 }), 101)).toBe('invalidCount');
        expect(validateCashSplitPayments([
            { payer: 'Alice', amount: 1 },
            { payer: 'Bob', amount: 1 }
        ], 2.5)).toBe('invalidTotal');
        expect(validateCashSplitPayments([
            { payer: ' ', amount: 5000 },
            { payer: 'Bob', amount: 7000 }
        ], 12000)).toBe('invalidEntry');
        expect(validateCashSplitPayments([
            { payer: 'Alice', amount: 5000.5 },
            { payer: 'Bob', amount: 6999.5 }
        ], 12000)).toBe('invalidEntry');
        expect(validateCashSplitPayments([
            { payer: 'Alice', amount: 5000 },
            { payer: 'Bob', amount: 6999 }
        ], 12000)).toBe('totalMismatch');
    });
});
