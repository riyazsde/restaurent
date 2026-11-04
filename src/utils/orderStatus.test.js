import { canMarkOrderReady, getOrderStatusKey } from './orderStatus';

describe('getOrderStatusKey', () => {
    test.each([
        ['In_Kitchen', 'inKitchen'],
        ['in kitchen', 'inKitchen'],
        ['IN-PROGRESS', 'inProgress'],
        ['In Preparation', 'preparing'],
        ['Canceled', 'cancelled'],
        ['Complete', 'completed'],
        ['On_Hold', 'onHold'],
        ['Pending', 'pending'],
        ['an_unrecognized_internal_value', 'other'],
        ['', 'other']
    ])('maps %s to %s', (status, expected) => {
        expect(getOrderStatusKey(status)).toBe(expected);
    });

    describe('canMarkOrderReady', () => {
        test.each([
            ['Preparing', true],
            ['In_Kitchen', true],
            ['Cancelled', false],
            ['Canceled', false],
            ['Ready', false],
            ['Served', false],
            ['Completed', false]
        ])('allows Ready transition from %s: %s', (status, expected) => {
            expect(canMarkOrderReady(status)).toBe(expected);
        });
    });
});
