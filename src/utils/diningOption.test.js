import { normalizeDiningOption } from './diningOption';

describe('normalizeDiningOption', () => {
    test.each([
        ['Dine in', 'Dine in'],
        [' delivery ', 'Delivery'],
        ['Take away', 'Take Away'],
        ['takeaway', 'Take Away'],
        ['TAKE_AWAY', 'Take Away'],
        ['Counter service', 'Counter service']
    ])('normalizes %s to %s', (input, expected) => {
        expect(normalizeDiningOption(input)).toBe(expected);
    });
});
