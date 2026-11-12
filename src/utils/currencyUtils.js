/**
 * Currency Formatting Utilities
 */

/**
 * Returns the configured currency without deriving or replacing it from the UI language.
 * @param {string} currency - Raw currency string from store profile
 * @returns {string} Configured currency code or symbol
 */
export const resolveCurrencySymbol = (currency) => {
    if (currency === undefined || currency === null) return '';
    return String(currency).trim();
}

export const getCurrencyFractionDigits = (currency) => {
    const resolved = resolveCurrencySymbol(currency);
    if (!/^[A-Za-z]{3}$/.test(resolved)) return 2;

    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: resolved
        }).resolvedOptions().maximumFractionDigits;
    } catch (error) {
        if (error instanceof RangeError) return 2;
        throw error;
    }
};

export const roundCurrencyAmount = (amount, currency) => {
    const factor = 10 ** getCurrencyFractionDigits(currency);
    return Math.round((Number(amount) + Number.EPSILON) * factor) / factor;
};

/**
 * Formats a numeric amount with the given currency code.
 * @param {number|string} amount - The numeric amount to format
 * @param {string} [currency] - The currency code or symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency) => {
    const resolved = resolveCurrencySymbol(currency);
    const formattedAmount = Number(amount || 0).toFixed(2);

    if (resolved === '$' || resolved === '€' || resolved === '£') {
        return `${resolved}${formattedAmount}`;
    }

    return resolved ? `${formattedAmount} ${resolved}` : formattedAmount;
};

export default formatCurrency;
