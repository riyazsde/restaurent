import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import posService from '../../services/posService';
import useAuthStore from '../../store/authStore';
import { rememberStripeOrderId } from '../../utils/stripeCheckout';
import StripePaymentReturn from './StripePaymentReturn';

const mockLocation = { pathname: '', search: '' };
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    useLocation: () => mockLocation,
    useNavigate: () => mockNavigate
}), { virtual: true });

jest.mock('../../services/posService', () => ({
    confirmStripePayment: jest.fn(),
    cancelStripePayment: jest.fn()
}));

jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
        info: jest.fn(),
        success: jest.fn()
    }
}));

const renderReturnPage = (path) => {
    mockLocation.pathname = path;
    mockLocation.search = '';
    return render(<StripePaymentReturn />);
};

describe('Stripe payment return page', () => {
    beforeEach(() => {
        posService.confirmStripePayment.mockReset();
        posService.cancelStripePayment.mockReset();
        window.sessionStorage.clear();
        useAuthStore.setState({ isLoading: false, userRole: 'Restaurant' });
    });

    it('keeps pending payments unconfirmed and allows another status check', async () => {
        rememberStripeOrderId(123);
        posService.confirmStripePayment
            .mockResolvedValueOnce({ httpStatus: 202 })
            .mockResolvedValueOnce({ httpStatus: 200, success: true });

        renderReturnPage('/payment/success');

        expect(await screen.findByText(/Payment is still pending/i)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Check payment status again/i }));

        expect(await screen.findByText(/Stripe payment verified successfully/i)).toBeInTheDocument();
        expect(posService.confirmStripePayment).toHaveBeenCalledTimes(2);
    });

    it('cancels the unpaid order on the cancellation return route', async () => {
        rememberStripeOrderId(456);
        posService.cancelStripePayment.mockResolvedValue({ success: true });

        renderReturnPage('/payment/cancel');

        expect(await screen.findByText(/Stripe Checkout was cancelled/i)).toBeInTheDocument();
        await waitFor(() => {
            expect(posService.cancelStripePayment).toHaveBeenCalledWith('456');
        });
    });
});
