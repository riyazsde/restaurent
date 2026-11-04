import { validateLoyaltyTierValues } from './loyaltyTierValidation';

describe('validateLoyaltyTierValues', () => {
    test.each([
        ['-100', '-2', { threshold: false, multiplier: false }],
        ['0', '0', { threshold: true, multiplier: false }],
        ['$500.00+', '1.75X', { threshold: true, multiplier: true }],
        ['500,00 €', '1,75x', { threshold: true, multiplier: true }],
        ['1,500 XOF+', '2X', { threshold: true, multiplier: true }],
        ['not a number', '1X', { threshold: false, multiplier: true }],
        ['100', '-1X', { threshold: true, multiplier: false }]
    ])('validates threshold %s and multiplier %s', (threshold, multiplier, expected) => {
        expect(validateLoyaltyTierValues({ threshold, multiplier })).toEqual(expected);
    });
});
