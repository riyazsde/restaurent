import { computeInventoryStatistics, getInventoryItemMetrics } from './inventoryUtils';

describe('inventory metrics', () => {
    test('uses the same stock and threshold fields as inventory rows', () => {
        const items = Array.from({ length: 8 }, (_, index) => ({
            id: index + 1,
            on_hand_quantity: 40,
            minimum_stock: 10,
            maximum_stock: 100,
            cost_per_unit: 200
        }));

        const stats = computeInventoryStatistics(items);

        expect(stats).toMatchObject({
            total_items: 8,
            ok_count: 8,
            low_stock_count: 0,
            critical_count: 0,
            expiring_count: 0,
            expired_count: 0,
            overstocked_count: 0,
            total_value: 64000
        });
        expect(getInventoryItemMetrics(items[0])).toMatchObject({
            current: 40,
            min: 10,
            max: 100,
            cost: 200,
            status: 'OK',
            totalValue: 8000
        });
    });

    test('keeps expired and expiring stock in separate status buckets', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const stats = computeInventoryStatistics([
            { on_hand_quantity: 1, minimum_stock: 0, maximum_stock: 5, cost_per_unit: 2, expiry_date: '2000-01-01' },
            { on_hand_quantity: 1, minimum_stock: 0, maximum_stock: 5, cost_per_unit: 2, expiry_date: tomorrow.toISOString() }
        ]);

        expect(stats.expired_count).toBe(1);
        expect(stats.expiring_count).toBe(1);
    });
});
