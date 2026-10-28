import i18n from '../i18n/config';

/**
 * Currency Formatting Utilities
 */

/**
 * Resolves the display currency code/symbol based on store currency and active language.
 * When the active language is English ('en'), 'ZAR' is displayed as '$'.
 * @param {string} currency - Raw currency string from store profile
 * @returns {string} Resolved currency symbol or code
 */
export const resolveCurrencySymbol = (currency) => {
    const isEnglish = String(i18n?.language || '').toLowerCase().startsWith('en');
    if (!currency) {
        return isEnglish ? '$' : 'XOF';
    }
    const cleanCurrency = currency.includes(' - ')
        ? currency.split(' - ')[1].trim()
        : String(currency).trim();

    if (isEnglish && (cleanCurrency.toUpperCase() === 'ZAR' || cleanCurrency.toUpperCase() === 'USD' || cleanCurrency === '$')) {
        return '$';
    }

    return cleanCurrency || (isEnglish ? '$' : 'XOF');
};

/**
 * Formats a numeric amount with the given currency code.
 * When in English and currency is ZAR (or $/USD or omitted), displays '$' instead of 'ZAR'.
 * @param {number|string} amount - The numeric amount to format
 * @param {string} [currency] - The currency code or symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency) => {
    const resolved = resolveCurrencySymbol(currency);
    const formattedAmount = Number(amount || 0).toFixed(2);

    if (resolved === '$') {
        return `$${formattedAmount}`;
    }

    return `${formattedAmount} ${resolved}`;
};

export default formatCurrency;
