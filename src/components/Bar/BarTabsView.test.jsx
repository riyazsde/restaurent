import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import BarTabsView from './BarTabsView';

const mockCloseTab = jest.fn();

jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn()
}), { virtual: true });

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key, fallback) => fallback || key })
}));

jest.mock('../../hooks/queries/usePos', () => ({
    useRestaurant: () => ({ data: { currency: 'XOF' } })
}));

jest.mock('../../hooks/queries/useBarTabs', () => ({
    useBarTabs: () => ({
        getBarTabs: {
            data: [{ Bar_Tab_id: 8, client_name: 'Guest', total: 1250, items: [] }],
            isLoading: false
        },
        addItemToTab: { mutate: jest.fn() },
        closeTab: { mutateAsync: mockCloseTab, isPending: false },
        createBarTab: { mutate: jest.fn(), isPending: false }
    })
}));

jest.mock('./BarTabCard', () => {
    const React = jest.requireActual('react');
    return ({ tab, onCloseTab }) => React.createElement(
        'button',
        { onClick: () => onCloseTab(tab) },
        'Close this tab'
    );
});

jest.mock('./CloseTabConfirmModal', () => {
    const React = jest.requireActual('react');
    return ({ isOpen, onConfirm }) => isOpen
        ? React.createElement('button', { onClick: onConfirm }, 'Confirm tab close')
        : null;
});

jest.mock('./modals/BarTabPaymentModal', () => {
    const React = jest.requireActual('react');
    return ({ isOpen, onConfirm }) => isOpen
        ? React.createElement(
            'button',
            { onClick: () => onConfirm('QA Cash 1031') },
            'Submit payment'
        )
        : null;
});

describe('BarTabsView close payment request', () => {
    beforeEach(() => {
        mockCloseTab.mockReset().mockResolvedValue({ success: true });
    });

    test('sends the selected method and payment confirmation to the close endpoint', async () => {
        render(<BarTabsView />);

        fireEvent.click(screen.getByRole('button', { name: 'Close this tab' }));
        fireEvent.click(screen.getByRole('button', { name: 'Confirm tab close' }));
        fireEvent.click(screen.getByRole('button', { name: 'Submit payment' }));

        await waitFor(() => {
            expect(mockCloseTab).toHaveBeenCalledWith({
                id: 8,
                data: {
                    payment_method: 'QA Cash 1031',
                    payment_confirmed: true
                }
            });
        });
    });
});
