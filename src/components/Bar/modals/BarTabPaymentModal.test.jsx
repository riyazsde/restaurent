import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import BarTabPaymentModal from './BarTabPaymentModal';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, fallback, values) => {
            const text = fallback || key;
            return values
                ? Object.entries(values).reduce(
                    (result, [name, value]) => result.replace(`{{${name}}}`, value),
                    text
                )
                : text;
        }
    })
}));

jest.mock('../../../hooks/queries/usePos', () => ({
    usePaymentOptions: () => ({
        data: [{ Payment_Options_id: 2, PaymentOption: [{ option: 'Cash' }, { option: 'Credit Card' }] }],
        isLoading: false
    })
}));

jest.mock('../../../hooks/queries/usePaymentIntegrations', () => ({
    useMerchantPaymentConfigs: () => ({
        data: [{ provider: 'Stripe', display_name: 'Stripe Checkout', merchant_account_id: 'acct_test', enabled: true }],
        isLoading: false
    })
}));

describe('BarTabPaymentModal', () => {
    test('shows tab identity, complete currency total, breakdown, tenders, and provider status', () => {
        render(
            <BarTabPaymentModal
                isOpen
                onClose={jest.fn()}
                onConfirm={jest.fn()}
                isProcessing={false}
                currency="XOF"
                tab={{
                    client_name: 'QA BAR1031',
                    table_no: '#1031',
                    total: 3750,
                    SubTotal: 3500,
                    Tax: 350,
                    Discount: 100
                }}
            />
        );

        expect(screen.getByText('QA BAR1031 · Tab #1031')).toBeInTheDocument();
        expect(screen.getByText('3750.00 XOF')).toBeInTheDocument();
        expect(screen.getByText('3500.00 XOF')).toBeInTheDocument();
        expect(screen.getByText('350.00 XOF')).toBeInTheDocument();
        expect(screen.getByText('−100.00 XOF')).toBeInTheDocument();
        expect(screen.getByText('Stripe Checkout')).toBeInTheDocument();
        expect(screen.getByText('Configured')).toBeInTheDocument();
        expect(screen.getByLabelText('Cash')).toBeInTheDocument();
        expect(screen.getByLabelText('Credit Card')).toBeInTheDocument();
    });

    test('confirms the selected supported tender', () => {
        const onConfirm = jest.fn();
        render(
            <BarTabPaymentModal
                isOpen
                onClose={jest.fn()}
                onConfirm={onConfirm}
                isProcessing={false}
                currency="XOF"
                tab={{ client_name: 'QA BAR1031', table_no: '#1031', total: 3750 }}
            />
        );

        fireEvent.click(screen.getByLabelText('Credit Card'));
        fireEvent.click(screen.getByRole('button', { name: 'Pay 3750.00 XOF' }));

        expect(onConfirm).toHaveBeenCalledWith('Credit Card');
    });

    test('prevents payment when the store currency is unavailable', () => {
        render(
            <BarTabPaymentModal
                isOpen
                onClose={jest.fn()}
                onConfirm={jest.fn()}
                isProcessing={false}
                tab={{ client_name: 'QA BAR1031', table_no: '#1031', total: 3750 }}
            />
        );

        expect(screen.getByText('Store currency is unavailable. Configure it before taking payment.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Pay 3750.00' })).toBeDisabled();
    });
});
