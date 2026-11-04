import { parseCustomersCSV } from './customerCsvUtils';

describe('parseCustomersCSV', () => {
    it('imports customers without a DOB as null', () => {
        const { validRows, skippedCount } = parseCustomersCSV(
            'Name,Phone,DOB\nAlex Morgan,+15551234567,'
        );

        expect(skippedCount).toBe(0);
        expect(validRows).toHaveLength(1);
        expect(validRows[0].DOB).toBeNull();
    });

    it('preserves a supplied DOB', () => {
        const { validRows } = parseCustomersCSV(
            'Name,Phone,DOB\nAlex Morgan,+15551234567,1990-01-02'
        );

        expect(validRows[0].DOB).toBe('1990-01-02');
    });
});
