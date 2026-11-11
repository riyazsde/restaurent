import api from './api';
import restaurantApi from './restaurant.api';

jest.mock('./api', () => ({
    get: jest.fn()
}));

describe('restaurantApi', () => {
    it('searches restaurants with the q and limit query parameters', () => {
        restaurantApi.search('pizza', 5);

        expect(api.get).toHaveBeenCalledWith('/restaurant/search', {
            params: { q: 'pizza', limit: 5 }
        });
    });
});
