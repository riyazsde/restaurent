import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/currencyUtils';

const CloseTabConfirmModal = ({ isOpen, onClose, onConfirm, tab, currency }) => {
    const { t } = useTranslation('common');

    if (!isOpen) return null;

    const customerName = tab?.client_name || tab?.customer_name || tab?.Customer?.Name || t('bar.payment.guest', 'Guest');
    const tabName = tab?.tab_name || tab?.name || tab?.table_no || tab?.table_number || tab?.Bar_Tab_id || tab?.id || '';
    const total = Number(tab?.total ?? tab?.Total ?? tab?.grand_total ?? tab?.total_amount ?? 0);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-poppins">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900">
                    {t('bar.payment.confirmCloseTitle', 'Close this bar tab?')}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    {t('bar.payment.confirmCloseDescription', 'Review the customer and balance before continuing to payment.')}
                </p>
                <div className="mt-5 rounded-xl border border-purple-100 bg-purple-50/60 p-4">
                    <p className="font-semibold text-gray-900">
                        {t('bar.payment.customerTab', '{{customer}} · Tab {{tab}}', {
                            customer: customerName,
                            tab: tabName
                        })}
                    </p>
                    <p className="mt-2 text-lg font-bold text-[#A62673]">
                        {formatCurrency(total, currency)}
                    </p>
                    {!currency && (
                        <p className="mt-2 text-sm text-amber-800">
                            {t('bar.payment.currencyUnavailable', 'Store currency is unavailable. Configure it before taking payment.')}
                        </p>
                    )}
                </div>
                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        {t('bar.payment.cancel', 'Cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={!currency || total <= 0}
                        className="flex-1 rounded-xl bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] px-4 py-3 font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {t('bar.payment.continueToPayment', 'Continue to payment')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CloseTabConfirmModal;
