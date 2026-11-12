import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { planApi } from '../../api/plan.api';
import {
    clearSubscriptionCheckout,
    saveSubscriptionCheckout
} from '../../utils/subscriptionCheckout';
import SubscriptionPaymentResult from './SubscriptionPaymentResult';

const mockNavigate = jest.fn();
const mockLocation = { search: '?checkoutId=checkout-123' };
const mockTranslate = (key) => key;

jest.mock('react-router-dom', () => ({
    Link: () => null,
    useLocation: () => mockLocation,
    useNavigate: () => mockNavigate
}), { virtual: true });

jest.mock('../../api/plan.api', () => ({
    planApi: {
        getSignupCheckoutStatus: jest.fn()
    }
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: mockTranslate })
}));

jest.mock('../LanguageSelector/LanguageSelector', () => () => null);

const renderResultPage = () => render(<SubscriptionPaymentResult />);

describe('subscription payment result page', () => {
    beforeEach(() => {
        clearSubscriptionCheckout();
        planApi.getSignupCheckoutStatus.mockReset();
        mockNavigate.mockReset();
        saveSubscriptionCheckout({
            checkoutId: 'checkout-123',
            idempotencyKey: 'same-attempt-key',
            email: 'owner@example.com'
        });
    });

    test('only allows sign-in after the backend reports succeeded', async () => {
        planApi.getSignupCheckoutStatus.mockResolvedValue({
            data: { success: true, data: { status: 'succeeded' } }
        });

        renderResultPage();

        const signInButton = await screen.findByRole('button', {
            name: 'subscriptionCheckout.signIn'
        });
        expect(planApi.getSignupCheckoutStatus).toHaveBeenCalledWith(
            'checkout-123',
            'same-attempt-key'
        );

        fireEvent.click(signInButton);
        expect(mockNavigate).toHaveBeenCalledWith(
            '/signin',
            { state: { email: 'owner@example.com' } }
        );
    });

    test('keeps processing payments pending without offering sign-in', async () => {
        planApi.getSignupCheckoutStatus.mockResolvedValue({
            data: { success: true, data: { status: 'processing' } }
        });

        renderResultPage();

        expect(await screen.findByText('subscriptionCheckout.pendingMessage')).toBeInTheDocument();
        expect(screen.queryByRole('button', {
            name: 'subscriptionCheckout.signIn'
        })).not.toBeInTheDocument();
    });
});
