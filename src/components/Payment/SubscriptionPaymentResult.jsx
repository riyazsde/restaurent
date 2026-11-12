import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { planApi } from '../../api/plan.api';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import {
    clearSubscriptionCheckout,
    getSubscriptionCheckout
} from '../../utils/subscriptionCheckout';

const TERMINAL_FAILURE_STATUSES = new Set(['failed', 'canceled', 'cancelled', 'refunded']);
const CHECK_INTERVAL_MS = 3000;
const MAX_STATUS_CHECKS = 60;

const SubscriptionPaymentResult = () => {
    const { t } = useTranslation('auth');
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const checkoutId = query.get('checkoutId') || query.get('checkout_id') || '';
    const [checkoutContext, setCheckoutContext] = useState(undefined);
    const [status, setStatus] = useState('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [retryNumber, setRetryNumber] = useState(0);
    const [isPolling, setIsPolling] = useState(false);

    useEffect(() => {
        try {
            setCheckoutContext(getSubscriptionCheckout());
        } catch {
            setCheckoutContext(null);
            setStatus('error');
            setErrorMessage(t('subscriptionCheckout.contextError'));
        }
    }, [t]);

    useEffect(() => {
        if (checkoutContext === undefined) return undefined;
        if (!checkoutId || !checkoutContext?.idempotencyKey || checkoutContext.checkoutId !== checkoutId) {
            setStatus('error');
            setErrorMessage(t('subscriptionCheckout.contextError'));
            return undefined;
        }

        let isActive = true;
        let timer;
        let checks = 0;
        const poll = async () => {
            if (!isActive) return;
            checks += 1;
            setIsPolling(true);
            setStatus('checking');
            setErrorMessage('');
            try {
                const response = await planApi.getSignupCheckoutStatus(
                    checkoutId,
                    checkoutContext.idempotencyKey
                );
                if (!isActive) return;
                const result = response?.data?.data || response?.data || response;
                const nextStatus = String(result?.status || result?.data?.status || '').toLowerCase();
                if (!nextStatus) {
                    throw new Error(t('subscriptionCheckout.statusError'));
                }

                setStatus(nextStatus);
                if (nextStatus === 'succeeded') {
                    clearSubscriptionCheckout();
                    setIsPolling(false);
                    return;
                }
                if (TERMINAL_FAILURE_STATUSES.has(nextStatus)) {
                    setIsPolling(false);
                    return;
                }
                if (!['requires_payment', 'processing', 'pending'].includes(nextStatus)) {
                    throw new Error(t('subscriptionCheckout.statusError'));
                }
                if (checks >= MAX_STATUS_CHECKS) {
                    setStatus('pending');
                    setIsPolling(false);
                    return;
                }
                timer = window.setTimeout(poll, CHECK_INTERVAL_MS);
            } catch (error) {
                if (!isActive) return;
                setStatus('error');
                setErrorMessage(error?.response?.data?.message || error?.message || t('subscriptionCheckout.statusError'));
                setIsPolling(false);
            }
        };

        poll();
        return () => {
            isActive = false;
            window.clearTimeout(timer);
        };
    }, [checkoutContext, checkoutId, retryNumber, t]);

    const isFailure = TERMINAL_FAILURE_STATUSES.has(status);
    const isSucceeded = status === 'succeeded';
    const isPending = ['checking', 'loading', 'requires_payment', 'processing', 'pending'].includes(status);

    const handleReturnToPlans = () => {
        navigate('/', { state: { scrollToSubscriptions: true } });
    };

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="mx-auto flex max-w-xl justify-end">
                <LanguageSelector variant="auth" />
            </div>
            <section className="mx-auto mt-12 max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg">
                <h1 className="text-2xl font-bold text-gray-900">
                    {isSucceeded
                        ? t('subscriptionCheckout.successTitle')
                        : t('subscriptionCheckout.resultTitle')}
                </h1>
                <p className="mt-4 text-gray-600" role={status === 'error' ? 'alert' : 'status'}>
                    {isSucceeded
                        ? t('subscriptionCheckout.successMessage')
                        : errorMessage
                            || (isFailure
                                ? t(`subscriptionCheckout.statuses.${status}`)
                                : isPending
                                    ? t('subscriptionCheckout.pendingMessage')
                                    : t('subscriptionCheckout.statusError'))}
                </p>

                {isSucceeded && (
                    <button
                        type="button"
                        onClick={() => navigate('/signin', { state: { email: checkoutContext?.email || '' } })}
                        className="mt-7 w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-3 font-bold text-white"
                    >
                        {t('subscriptionCheckout.signIn')}
                    </button>
                )}
                {!isSucceeded && !isFailure && (
                    <button
                        type="button"
                        onClick={() => setRetryNumber((value) => value + 1)}
                        disabled={isPolling || isPending && status !== 'pending'}
                        className="mt-7 w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-3 font-bold text-white disabled:opacity-50"
                    >
                        {t('subscriptionCheckout.checkAgain')}
                    </button>
                )}
                {isFailure && (
                    <button
                        type="button"
                        onClick={handleReturnToPlans}
                        className="mt-7 w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-3 font-bold text-white"
                    >
                        {t('subscriptionCheckout.tryAgain')}
                    </button>
                )}
                {!isSucceeded && (
                    <Link to="/" className="mt-4 block text-sm text-gray-500 underline">
                        {t('subscriptionCheckout.returnHome')}
                    </Link>
                )}
            </section>
        </main>
    );
};

export default SubscriptionPaymentResult;
