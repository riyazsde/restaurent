import i18n from '../i18n/config';
import { formatCurrency, resolveCurrencySymbol } from './currencyUtils';

describe('currency formatting', () => {
    afterEach(async () => {
        await i18n.changeLanguage('fr');
    });

    it.each(['fr', 'en'])('keeps XOF as XOF when the UI language is %s', async (language) => {
        await i18n.changeLanguage(language);

        expect(resolveCurrencySymbol('XOF')).toBe('XOF');
        expect(formatCurrency(51683.27, 'XOF')).toBe('51683.27 XOF');
    });

    it('does not replace configured currency codes with dollar symbols', () => {
        expect(formatCurrency(16, 'ZAR')).toBe('16.00 ZAR');
        expect(formatCurrency(16, 'USD')).toBe('16.00 USD');
    });

    it('does not infer a currency when none is configured', () => {
        expect(formatCurrency(16)).toBe('16.00');
    });
});
