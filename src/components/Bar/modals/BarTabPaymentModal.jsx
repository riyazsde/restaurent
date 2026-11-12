import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../utils/currencyUtils';
import { usePaymentOptions } from '../../../hooks/queries/usePos';
import { useMerchantPaymentConfigs } from '../../../hooks/queries/usePaymentIntegrations';

const readAmount = (source, fields) => {
    for (const field of fields) {
        const value = source?.[field];
        if (value !== undefined && value !== null && value !== '') {
            const amount = Number(value);
            if (Number.isFinite(amount)) return amount;
        }
    }
    return null;
};

const getTenderLabel = (t, name) => {
    const normalizedName = String(name).trim().toLowerCase();
    const labels = {
        cash: 'cash',
        'credit card': 'creditCard',
        'debit card': 'debitCard',
        'gift card': 'giftCard',
        'mobile money': 'mobileMoney',
        'momo money': 'mobileMoney',
        'orange money': 'orangeMoney'
    };
    const translationKey = labels[normalizedName];
    return translationKey
        ? t(`bar.payment.tenderNames.${translationKey}`, name)
        : name;
};

const BarTabPaymentModal = ({ isOpen, onClose, onConfirm, tab, currency, isProcessing }) => {
    const { t } = useTranslation('common');
    const { data: paymentOptions = [], isLoading: isLoadingPaymentOptions } = usePaymentOptions();
    const { data: providerConfigs = [], isLoading: isLoadingProviders } = useMerchantPaymentConfigs();
    const [selectedMethod, setSelectedMethod] = useState('');

    const tenders = useMemo(() => {
        const options = (Array.isArray(paymentOptions) ? paymentOptions : []).flatMap((paymentOption) => {
            if (paymentOption?.Status === false || paymentOption?.enabled === false) return [];
            const nestedOptions = Array.isArray(paymentOption?.PaymentOption)
                ? paymentOption.PaymentOption
                : [paymentOption];

            return nestedOptions
                .filter((option) => option && option.Status !== false && option.enabled !== false)
                .map((option) => ({
                    id: option.Payment_Options_id || paymentOption.Payment_Options_id || option.id || option.option,
                    name: option.option || option.Name || option.name || paymentOption.Name
                }))
                .filter((option) => option.name);
        });

        return options.filter((option, index) =>
            options.findIndex((other) => String(other.name).toLowerCase() === String(option.name).toLowerCase()) === index
        );
    }, [paymentOptions]);

    useEffect(() => {
        if (isOpen) {
            setSelectedMethod((currentMethod) =>
                tenders.some((tender) => tender.name === currentMethod)
                    ? currentMethod
                    : tenders[0]?.name || ''
            );
        }
    }, [isOpen, tenders]);

    if (!isOpen) return null;

    const customerName = tab?.client_name || tab?.customer_name || tab?.Customer?.Name || t('bar.payment.guest', 'Guest');
    const tabName = tab?.tab_name || tab?.name || tab?.table_no || tab?.table_number || tab?.Bar_Tab_id || tab?.id || '';
    const total = readAmount(tab, ['total', 'Total', 'grand_total', 'Grand_Total', 'total_amount', 'Total_Amount']) || 0;
    const tax = readAmount(tab, ['tax', 'Tax', 'tax_amount', 'Tax_Amount']);
    const discount = readAmount(tab, ['discount', 'Discount', 'discount_amount', 'Discount_Amount']);
    const subtotal = readAmount(tab, ['subtotal', 'SubTotal', 'sub_total', 'items_total']);
    const serviceCharge = readAmount(tab, ['service_charge', 'Service_Charge', 'serviceCharge']) || 0;
    const resolvedTax = tax ?? 0;
    const resolvedDiscount = discount ?? 0;
    const resolvedSubtotal = subtotal ?? (total - resolvedTax - serviceCharge + resolvedDiscount);
    const providers = Array.isArray(providerConfigs) ? providerConfigs : [];
    const isCashTender = /\bcash\b|esp[eè]ces/i.test(selectedMethod);
    const canSubmit = Boolean(currency) && total > 0 && Boolean(selectedMethod) && tenders.length > 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 font-poppins">
            <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-5 top-5 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    aria-label={t('bar.payment.close', 'Close')}
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="pr-10 text-2xl font-bold text-gray-900">
                    {t('bar.payment.paymentTitle', 'Complete bar tab payment')}
                </h2>
                <div className="mt-4 rounded-2xl border border-purple-100 bg-purple-50/60 p-4">
                    <p className="font-semibold text-gray-900">
                        {t('bar.payment.customerTab', '{{customer}} · Tab {{tab}}', {
                            customer: customerName,
                            tab: tabName
                        })}
                    </p>
                    <div className="mt-3 space-y-1.5 border-t border-purple-100 pt-3 text-sm">
                        <div className="flex justify-between gap-3">
                            <span className="text-gray-600">{t('bar.payment.subtotal', 'Subtotal')}</span>
                            <span>{formatCurrency(resolvedSubtotal, currency)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-gray-600">{t('bar.payment.taxes', 'Taxes')}</span>
                            <span>{tax === null ? t('bar.payment.includedOrNotSet', 'Included in tab total / not separately listed') : formatCurrency(resolvedTax, currency)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-gray-600">{t('bar.payment.discount', 'Discount')}</span>
                            <span>{discount === null ? t('bar.payment.none', 'None listed') : `−${formatCurrency(resolvedDiscount, currency)}`}</span>
                        </div>
                        {serviceCharge > 0 && (
                            <div className="flex justify-between gap-3">
                                <span className="text-gray-600">{t('bar.payment.serviceCharge', 'Service charge')}</span>
                                <span>{formatCurrency(serviceCharge, currency)}</span>
                            </div>
                        )}
                        <div className="flex justify-between gap-3 border-t border-purple-100 pt-2 text-base font-bold text-gray-900">
                            <span>{t('bar.payment.totalDue', 'Total due')}</span>
                            <span>{formatCurrency(total, currency)}</span>
                        </div>
                    </div>
                    {!currency && (
                        <p className="mt-2 text-sm text-amber-800">
                            {t('bar.payment.currencyUnavailable', 'Store currency is unavailable. Configure it before taking payment.')}
                        </p>
                    )}
                </div>

                <section className="mt-5">
                    <h3 className="mb-2 text-sm font-bold text-gray-900">
                        {t('bar.payment.supportedTenders', 'Supported payment methods')}
                    </h3>
                    {isLoadingPaymentOptions ? (
                        <p className="text-sm text-gray-500">{t('bar.payment.loadingMethods', 'Loading payment methods...')}</p>
                    ) : tenders.length === 0 ? (
                        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                            {t('bar.payment.noMethodsConfigured', 'No payment methods are configured for this restaurant. Configure one before closing this tab.')}
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {tenders.map((tender) => (
                                <label
                                    key={`${tender.id}-${tender.name}`}
                                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 ${
                                        selectedMethod === tender.name ? 'border-purple-700 bg-purple-50' : 'border-gray-200'
                                    }`}
                                >
                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                                        <CreditCard className="h-4 w-4 text-purple-700" />
                                        {getTenderLabel(t, tender.name)}
                                    </span>
                                    <input
                                        type="radio"
                                        name="bar-tab-payment-method"
                                        value={tender.name}
                                        checked={selectedMethod === tender.name}
                                        onChange={() => setSelectedMethod(tender.name)}
                                        className="accent-purple-700"
                                    />
                                </label>
                            ))}
                        </div>
                    )}
                </section>

                <section className="mt-5 rounded-xl border border-gray-200 p-4">
                    {isCashTender ? (
                        <>
                            <h3 className="text-sm font-bold text-gray-900">
                                {t('bar.payment.manualCashPayment', 'Manual cash payment')}
                            </h3>
                            <p className="mt-2 text-sm text-gray-700">
                                {t(
                                    'bar.payment.cashProviderNotRequired',
                                    'Cash does not require an online payment provider. Confirm you received the cash before closing the tab.'
                                )}
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-sm font-bold text-gray-900">
                                {t('bar.payment.providerStatus', 'Payment provider status')}
                            </h3>
                            {isLoadingProviders ? (
                                <p className="mt-2 text-sm text-gray-500">{t('bar.payment.loadingProviders', 'Checking configured providers...')}</p>
                            ) : providers.length > 0 ? (
                                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                    {providers.map((provider, index) => {
                                        const configured = provider.enabled !== false &&
                                            Boolean(provider.merchant_account_id || provider.account_id);
                                        const providerName = provider.display_name || provider.provider || provider.Provider || t('bar.payment.provider', 'Provider');
                                        return (
                                            <li key={`${providerName}-${index}`} className="flex justify-between gap-3">
                                                <span>{providerName}</span>
                                                <span className={configured ? 'text-green-700' : 'text-gray-500'}>
                                                    {configured ? t('bar.payment.configured', 'Configured') : t('bar.payment.notConfigured', 'Not configured')}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="mt-2 text-sm text-amber-800">
                                    {t('bar.payment.noProviderConfigured', 'No payment provider is configured.')}
                                </p>
                            )}
                        </>
                    )}
                </section>

                <button
                    type="button"
                    onClick={() => onConfirm(selectedMethod)}
                    disabled={isProcessing || isLoadingPaymentOptions || !canSubmit}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isProcessing
                        ? t('bar.payment.processing', 'Processing...')
                        : t('bar.payment.payAmount', 'Pay {{amount}}', { amount: formatCurrency(total, currency) })}
                </button>
            </div>
        </div>
    );
};

export default BarTabPaymentModal;
