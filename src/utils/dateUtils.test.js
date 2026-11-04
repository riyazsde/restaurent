import { formatDateOnly } from './dateUtils';

describe('formatDateOnly', () => {
    it('formats the calendar date from an ISO date without local timezone shifts', () => {
        expect(formatDateOnly('1990-02-15')).toBe('15/02/1990');
        expect(formatDateOnly('1990-02-15T00:00:00.000Z')).toBe('15/02/1990');
    });

    it('handles leap days and rejects invalid date-only values', () => {
        expect(formatDateOnly('2024-02-29')).toBe('29/02/2024');
        expect(formatDateOnly('2023-02-29')).toBe('N/A');
        expect(formatDateOnly('')).toBe('N/A');
    });
});
