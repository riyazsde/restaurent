jest.mock('../api/api', () => ({
  post: jest.fn()
}));

import api from '../api/api';
import useAuthStore from '../store/authStore';
import posService from './posService';

describe('POS Stripe payment endpoints', () => {
  beforeEach(() => {
    api.post.mockReset();
    useAuthStore.setState({ userRole: 'Restaurant' });
  });

  it('uses the restaurant payment routes by default', async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    await posService.createStripePaymentLink(123);
    await posService.cancelStripePayment(123);

    expect(api.post).toHaveBeenNthCalledWith(
      1,
      '/restaurant/pos_order/123/payment-link',
      {}
    );
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      '/restaurant/pos_order/123/payment/cancel'
    );
  });

  it('uses employee routes and preserves the confirmation HTTP status', async () => {
    useAuthStore.setState({ userRole: 'Employee' });
    api.post.mockResolvedValue({ data: { success: true }, status: 202 });

    const response = await posService.confirmStripePayment(456);

    expect(api.post).toHaveBeenCalledWith(
      '/employee/pos_order/456/payment/confirm'
    );
    expect(response).toEqual({ success: true, httpStatus: 202 });
  });
});
