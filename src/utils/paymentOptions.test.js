import { findPaymentOptionId } from './paymentOptions';

describe('findPaymentOptionId', () => {
    it('finds a nested cash option without selecting a preceding Stripe option', () => {
        const options = [
            { Payment_Options_id: 1, PaymentOption: [{ option: 'Stripe' }] },
            { Payment_Options_id: 4, PaymentOption: [{ option: 'Cash' }] }
        ];

        expect(findPaymentOptionId(options, 'cash')).toBe(4);
    });

    it('supports direct and object-shaped payment options', () => {
        expect(findPaymentOptionId([
            { Payment_Options_id: 6, option: 'Cash Payment' }
        ], 'cash')).toBe(6);

        expect(findPaymentOptionId([
            { Payment_Options_id: 7, PaymentOption: { option: 'Cash' } }
        ], 'cash')).toBe(7);
    });

    it('returns null when the requested payment method is unavailable', () => {
        expect(findPaymentOptionId([
            { Payment_Options_id: 1, PaymentOption: [{ option: 'Stripe' }] }
        ], 'cash')).toBeNull();
    });
});
