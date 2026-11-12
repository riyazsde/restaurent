export const findPaymentOptionId = (paymentOptions, methodName) => {
    const method = String(methodName || '').trim().toLowerCase();
    if (!method || !Array.isArray(paymentOptions)) return null;

    for (const paymentOption of paymentOptions) {
        if (paymentOption?.Status === false || paymentOption?.enabled === false) continue;

        const nestedOptions = Array.isArray(paymentOption?.PaymentOption)
            ? paymentOption.PaymentOption
            : paymentOption?.PaymentOption
                ? [paymentOption.PaymentOption]
                : [paymentOption];

        for (const option of nestedOptions) {
            if (!option || option.Status === false || option.enabled === false) continue;

            const name = String(
                option.option
                || option.Name
                || option.name
                || paymentOption.Name
                || paymentOption.name
                || ''
            ).trim().toLowerCase();
            if (!name.includes(method)) continue;

            const id = option.Payment_Options_id
                ?? paymentOption.Payment_Options_id
                ?? option.id
                ?? paymentOption.id;
            if (id !== undefined && id !== null && id !== '') return id;
        }
    }

    return null;
};
