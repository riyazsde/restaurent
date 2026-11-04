const normalizeNumericInput = (value) => {
    let normalized = String(value ?? '').trim();
    if (!normalized) return null;

    const commaGroups = /^(\d{1,3})(,\d{3})+(\.\d+)?$/.test(normalized);
    if (commaGroups) {
        normalized = normalized.replace(/,/g, '');
    } else if (normalized.includes(',') && !normalized.includes('.')) {
        normalized = normalized.replace(',', '.');
    }

    return normalized;
};

const parseTierAmount = (value, kind) => {
    const normalized = normalizeNumericInput(value);
    if (normalized === null) return null;

    const numberPattern = '([+-]?(?:\\d+(?:\\.\\d+)?|\\.\\d+))';
    const pattern = kind === 'threshold'
        ? new RegExp(`^(?:(?:[$€£¥]|[A-Za-z]{3})\\s*)?${numberPattern}(?:\\s*(?:[A-Za-z]{3}|[$€£¥]))?\\+?$`)
        : new RegExp(`^${numberPattern}(?:\\s*[xX])?$`);
    const match = normalized.match(pattern);
    if (!match) return null;

    const amount = Number(match[1]);
    return Number.isFinite(amount) ? amount : null;
};

export const validateLoyaltyTierValues = ({ threshold, multiplier }) => {
    const thresholdAmount = parseTierAmount(threshold, 'threshold');
    const multiplierAmount = parseTierAmount(multiplier, 'multiplier');

    return {
        threshold: thresholdAmount !== null && thresholdAmount >= 0,
        multiplier: multiplierAmount !== null && multiplierAmount > 0
    };
};
