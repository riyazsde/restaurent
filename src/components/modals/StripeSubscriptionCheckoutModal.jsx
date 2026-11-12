import React, { useMemo, useRef, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { planApi } from '../../api/plan.api';
import { useCountries } from '../../hooks/queries/useAuth';
import {
    createCheckoutIdempotencyKey,
    saveSubscriptionCheckout
} from '../../utils/subscriptionCheckout';

const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const StripePaymentForm = ({ checkout, checkoutContext }) => {
    const { t } = useTranslation('auth');
    const stripe = useStripe();
    const elements = useElements();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePayment = async (event) => {
        event.preventDefault();
        if (!stripe || !elements || isSubmitting) return;

        setIsSubmitting(true);
        try {
            saveSubscriptionCheckout({
                ...checkoutContext,
                checkoutId: checkout.checkoutId
            });
            const returnUrl = new URL('/signup/payment-result', window.location.origin);
            returnUrl.searchParams.set('checkoutId', checkout.checkoutId);
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: { return_url: returnUrl.toString() }
            });

            if (error) {
                toast.error(error.message || t('subscriptionCheckout.paymentError'));
                setIsSubmitting(false);
            }
        } catch (error) {
            toast.error(error?.message || t('subscriptionCheckout.paymentError'));
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handlePayment} className="space-y-5">
            <PaymentElement />
            <button
                type="submit"
                disabled={!stripe || !elements || isSubmitting}
                className="w-full rounded-xl bg-gradient-to-b from-brand-primary to-brand-secondary px-4 py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isSubmitting
                    ? t('subscriptionCheckout.processing')
                    : t('subscriptionCheckout.pay')}
            </button>
        </form>
    );
};

const StripeSubscriptionCheckoutModal = ({ isOpen, onClose, planId, planName }) => {
    const { t } = useTranslation('auth');
    const { data: rawCountries = [], isLoading: isLoadingCountries } = useCountries();
    const [businessName, setBusinessName] = useState('');
    const [email, setEmail] = useState('');
    const [countryId, setCountryId] = useState('');
    const [checkout, setCheckout] = useState(null);
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
    const attemptRef = useRef(null);

    const countries = useMemo(() => (
        Array.isArray(rawCountries)
            ? rawCountries.map((country) => ({
                id: country.Country_id ?? country.id ?? country._id,
                name: country.Country_name ?? country.name
            })).filter((country) => country.id !== undefined && country.id !== null && country.name)
            : []
    ), [rawCountries]);

    if (!isOpen) return null;

    const handleCreateCheckout = async (event) => {
        event.preventDefault();
        const numericPlanId = Number(planId);
        if (!Number.isInteger(numericPlanId) || numericPlanId <= 0) {
            toast.error(t('subscriptionCheckout.planRequired'));
            return;
        }
        if (!publishableKey || !stripePromise) {
            toast.error(t('subscriptionCheckout.stripeUnavailable'));
            return;
        }

        const payload = {
            businessName: businessName.trim(),
            email: email.trim().toLowerCase(),
            Admin_Plan_id: numericPlanId,
            currency: 'usd'
        };
        if (countryId) payload.Country_id = Number(countryId);

        const fingerprint = JSON.stringify(payload);
        setIsCreatingCheckout(true);
        try {
            if (attemptRef.current?.fingerprint !== fingerprint) {
                attemptRef.current = {
                    fingerprint,
                    idempotencyKey: createCheckoutIdempotencyKey()
                };
            }
            const response = await planApi.createSignupCheckout(
                payload,
                attemptRef.current.idempotencyKey
            );
            const result = response?.data?.data || response?.data || response;
            if (response?.data?.success === false || result?.success === false) {
                throw new Error(result?.message || response?.data?.message || t('subscriptionCheckout.createError'));
            }

            const checkoutId = result?.checkoutId || result?.checkout_id;
            const clientSecret = result?.clientSecret || result?.client_secret;
            if (!checkoutId || !clientSecret) {
                throw new Error(t('subscriptionCheckout.invalidResponse'));
            }

            const checkoutContext = {
                idempotencyKey: attemptRef.current.idempotencyKey,
                email: payload.email,
                businessName: payload.businessName,
                Admin_Plan_id: payload.Admin_Plan_id,
                Country_id: payload.Country_id
            };
            saveSubscriptionCheckout({ ...checkoutContext, checkoutId });
            setCheckout({ checkoutId, clientSecret });
        } catch (error) {
            toast.error(
                error?.response?.data?.message
                || error?.message
                || t('subscriptionCheckout.createError')
            );
        } finally {
            setIsCreatingCheckout(false);
        }
    };

    const checkoutContext = {
        idempotencyKey: attemptRef.current?.idempotencyKey,
        email: email.trim().toLowerCase(),
        businessName: businessName.trim(),
        Admin_Plan_id: Number(planId),
        Country_id: countryId ? Number(countryId) : undefined
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <button
                type="button"
                aria-label={t('subscriptionCheckout.close')}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !checkout && onClose()}
                disabled={Boolean(checkout)}
            />
            <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl md:p-8">
                {!checkout && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-5 top-5 text-gray-500 hover:text-black"
                        aria-label={t('subscriptionCheckout.close')}
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
                <h2 className="mb-2 pr-8 text-2xl font-bold text-gray-900">
                    {checkout
                        ? t('subscriptionCheckout.paymentTitle')
                        : t('subscriptionCheckout.title')}
                </h2>
                <p className="mb-6 text-sm text-gray-600">
                    {checkout
                        ? t('subscriptionCheckout.paymentSubtitle')
                        : t('subscriptionCheckout.subtitle')}
                </p>
                {!checkout && planName && (
                    <p className="mb-5 rounded-lg bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-900">
                        {t('subscriptionCheckout.selectedPlan', { plan: planName })}
                    </p>
                )}

                {checkout ? (
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret: checkout.clientSecret,
                            appearance: { theme: 'stripe' }
                        }}
                    >
                        <StripePaymentForm
                            checkout={checkout}
                            checkoutContext={checkoutContext}
                        />
                    </Elements>
                ) : (
                    <form onSubmit={handleCreateCheckout} className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">
                            {t('subscriptionCheckout.businessName')}
                            <input
                                type="text"
                                required
                                maxLength={120}
                                value={businessName}
                                onChange={(event) => setBusinessName(event.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal"
                                autoComplete="organization"
                            />
                        </label>
                        <label className="block text-sm font-semibold text-gray-700">
                            {t('subscriptionCheckout.email')}
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal"
                                autoComplete="email"
                            />
                        </label>
                        <label className="block text-sm font-semibold text-gray-700">
                            {t('subscriptionCheckout.country')}
                            <select
                                value={countryId}
                                onChange={(event) => setCountryId(event.target.value)}
                                disabled={isLoadingCountries}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal"
                            >
                                <option value="">{t('subscriptionCheckout.countryOptional')}</option>
                                {countries.map((country) => (
                                    <option key={country.id} value={country.id}>{country.name}</option>
                                ))}
                            </select>
                        </label>
                        <button
                            type="submit"
                            disabled={isCreatingCheckout || !Number.isInteger(Number(planId)) || Number(planId) <= 0}
                            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-brand-primary to-brand-secondary px-4 py-3.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isCreatingCheckout ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {t('subscriptionCheckout.starting')}
                                </>
                            ) : (
                                t('subscriptionCheckout.continue')
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default StripeSubscriptionCheckoutModal;
