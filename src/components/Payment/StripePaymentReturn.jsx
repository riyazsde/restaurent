import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import posService from '../../services/posService';
import useAuthStore from '../../store/authStore';
import {
    clearRememberedStripeOrderId,
    getRememberedStripeOrderId
} from '../../utils/stripeCheckout';

const StripePaymentReturn = () => {
    const { t } = useTranslation('pos');
    const location = useLocation();
    const navigate = useNavigate();
    const userRole = useAuthStore((state) => state.userRole);
    const isAuthLoading = useAuthStore((state) => state.isLoading);
    const isSuccess = location.pathname.endsWith('/success');
    const query = new URLSearchParams(location.search);
    const orderId = query.get('order_id')
        || query.get('orderId')
        || query.get('id')
        || getRememberedStripeOrderId();
    const [state, setState] = useState('processing');
    const [message, setMessage] = useState(
        isSuccess
            ? t('stripeReturn.verifying', 'Verifying Stripe payment...')
            : t('stripeReturn.cancelling', 'Releasing the unpaid order...')
    );

    const handleReturnAction = useCallback(async () => {
        if (!orderId) {
            setState('missing');
            setMessage(isSuccess
                ? t('stripeReturn.orderMissing', 'Could not identify the order to verify. Return to POS and check the order status.')
                : t('stripeReturn.cancelOrderMissing', 'Could not identify the unpaid order to release.'));
            return;
        }

        setState('processing');
        setMessage(isSuccess
            ? t('stripeReturn.verifying', 'Verifying Stripe payment...')
            : t('stripeReturn.cancelling', 'Releasing the unpaid order...'));

        try {
            if (isSuccess) {
                const response = await posService.confirmStripePayment(orderId);
                if (response.httpStatus === 202 || response.status === 202) {
                    setState('pending');
                    setMessage(t('stripeReturn.pending', 'Payment is still pending. Check again in a moment.'));
                    toast.info(t('stripeReturn.pending', 'Payment is still pending. Check again in a moment.'));
                    return;
                }
                if (response.httpStatus !== 200 || response.success === false) {
                    throw new Error(response.message || t('stripeReturn.failed', 'Unable to verify Stripe payment.'));
                }

                clearRememberedStripeOrderId();
                setState('paid');
                setMessage(t('stripeReturn.paid', 'Stripe payment verified successfully.'));
                toast.success(t('stripeReturn.paid', 'Stripe payment verified successfully.'));
                return;
            }

            await posService.cancelStripePayment(orderId);
            clearRememberedStripeOrderId();
            setState('cancelled');
            setMessage(t('stripeReturn.cancelled', 'Stripe Checkout was cancelled. The unpaid order is available for editing.'));
            toast.info(t('stripeReturn.cancelled', 'Stripe Checkout was cancelled. The unpaid order is available for editing.'));
        } catch (error) {
            const errorMessage = error?.response?.data?.message
                || error?.message
                || t('stripeReturn.failed', 'Unable to update Stripe payment status.');
            setState('error');
            setMessage(errorMessage);
            toast.error(errorMessage);
        }
    }, [isSuccess, orderId, t]);

    useEffect(() => {
        if (isAuthLoading) return;
        handleReturnAction();
    }, [handleReturnAction, isAuthLoading]);

    const returnToPos = () => navigate(userRole === 'Employee' ? '/employee/quick-order' : '/dashboard/pos');
    const canRetry = ['pending', 'error'].includes(state);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
                <h1 className="text-2xl font-bold text-gray-900">
                    {isSuccess ? t('stripeReturn.titleSuccess', 'Stripe payment') : t('stripeReturn.titleCancelled', 'Payment cancelled')}
                </h1>
                <p className="mt-4 text-sm text-gray-600" role={state === 'error' ? 'alert' : 'status'}>{message}</p>
                {canRetry && (
                    <button
                        type="button"
                        onClick={handleReturnAction}
                        disabled={state === 'processing'}
                        className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isSuccess
                            ? t('stripeReturn.checkAgain', 'Check payment status again')
                            : t('stripeReturn.cancelAgain', 'Try releasing the order again')}
                    </button>
                )}
                <button
                    type="button"
                    onClick={returnToPos}
                    className="mt-3 w-full rounded-xl bg-purple-700 px-4 py-3 font-bold text-white hover:bg-purple-800"
                >
                    {t('stripeReturn.returnToPos', 'Return to POS')}
                </button>
            </div>
        </div>
    );
};

export default StripePaymentReturn;
