import api from '../api/api';

const TIERS_STORAGE_KEY = 'loyalty_tiers_data';
const HAPPY_HOUR_STORAGE_KEY = 'loyalty_happy_hour_data';

const DEFAULT_TIERS = [
    { id: 1, tier: 'Platinum', emoji: '💎', threshold: '$0.00+', multiplier: '1X', benefits: 'Free Birthday Drink', status: true },
    { id: 2, tier: 'Gold', emoji: '🥇', threshold: '$250.00+', multiplier: '1.25X', benefits: '10% Off Entire Bill', status: true },
    { id: 3, tier: 'Sliver', emoji: '🥈', threshold: '$750.00+', multiplier: '1.5X', benefits: '15% Off Entire Bill, Special Event', status: true },
    { id: 4, tier: 'Bronze', emoji: '🥉', threshold: '$1,500.00+', multiplier: '2X', benefits: '15% Off Entire Bill, Priority Service', status: true },
];

const DEFAULT_HAPPY_HOUR = {
    enabled: true,
    multiplier: '1x',
    startTime: '16:00',
    endTime: '19:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
};

class LoyaltyService {
    // Helper to get tiers from local cache
    getLocalTiers() {
        try {
            const raw = localStorage.getItem(TIERS_STORAGE_KEY);
            return raw ? JSON.parse(raw) : DEFAULT_TIERS;
        } catch {
            return DEFAULT_TIERS;
        }
    }

    saveLocalTiers(tiers) {
        try {
            localStorage.setItem(TIERS_STORAGE_KEY, JSON.stringify(tiers));
        } catch (e) {
            console.error('Failed to save tiers to localStorage', e);
        }
    }

    // Helper to get happy hour settings
    getLocalHappyHour() {
        try {
            const raw = localStorage.getItem(HAPPY_HOUR_STORAGE_KEY);
            return raw ? JSON.parse(raw) : DEFAULT_HAPPY_HOUR;
        } catch {
            return DEFAULT_HAPPY_HOUR;
        }
    }

    saveLocalHappyHour(settings) {
        try {
            localStorage.setItem(HAPPY_HOUR_STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to save happy hour to localStorage', e);
        }
    }

    // Tiers CRUD
    async getTiers() {
        try {
            const response = await api.get('/restaurant/loyalty/tiers');
            if (response.data?.data && Array.isArray(response.data.data)) {
                return response.data;
            }
        } catch {
            // fallback to local storage
        }
        return { success: true, data: this.getLocalTiers() };
    }

    async createTier(data) {
        const tiers = this.getLocalTiers();
        const newTier = {
            id: Date.now(),
            tier: data.tier || 'New Tier',
            emoji: data.emoji || this.getEmojiForTier(data.tier),
            threshold: data.threshold || '$0.00+',
            multiplier: data.multiplier || '1X',
            benefits: data.benefits || '',
            status: data.status !== undefined ? Boolean(data.status) : true
        };
        const updated = [...tiers, newTier];
        this.saveLocalTiers(updated);

        try {
            await api.post('/restaurant/loyalty/tiers', newTier);
        } catch {
            // ignore network error, local persistence updated
        }
        return { success: true, data: newTier };
    }

    async updateTier(data) {
        const tiers = this.getLocalTiers();
        const updated = tiers.map(t => t.id === data.id ? { 
            ...t, 
            ...data,
            emoji: data.emoji || this.getEmojiForTier(data.tier)
        } : t);
        this.saveLocalTiers(updated);

        try {
            await api.put(`/restaurant/loyalty/tiers/${data.id}`, data);
        } catch {
            // ignore network error
        }
        return { success: true, data };
    }

    async deleteTier(id) {
        const tiers = this.getLocalTiers();
        const updated = tiers.filter(t => t.id !== id);
        this.saveLocalTiers(updated);

        try {
            await api.delete(`/restaurant/loyalty/tiers/${id}`);
        } catch {
            // ignore network error
        }
        return { success: true, id };
    }

    // Happy Hour Settings
    async getHappyHourSettings() {
        try {
            const response = await api.get('/restaurant/loyalty/happy-hour');
            if (response.data?.data) {
                return response.data;
            }
        } catch {
            // fallback
        }
        return { success: true, data: this.getLocalHappyHour() };
    }

    async updateHappyHourSettings(data) {
        this.saveLocalHappyHour(data);
        try {
            await api.put('/restaurant/loyalty/happy-hour', data);
        } catch {
            // ignore network error
        }
        return { success: true, data };
    }

    // Customer Loyalty Points adjustment - Matches scratch/postman.json
    // Endpoint: PUT {{baseUrl}}/restaurant/customer/loyalty/:CUSTOMER_ID
    // Body: { "points": 100, "action": "add" | "redeem" }
    async adjustCustomerPoints(customerId, { points, action = 'add', notes = '' }) {
        try {
            const response = await api.put(`/restaurant/customer/loyalty/${customerId}`, {
                points: Number(points),
                action: action, // 'add' | 'redeem'
                notes: notes
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    // Get Customers for points adjustment dropdown - Matches scratch/postman.json line 11051
    async getCustomers(params = { page: 1, limit: 100 }) {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.search) queryParams.append('search', params.search);

            const response = await api.get(`/restaurant/customer/getall?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }

    getEmojiForTier(tierName = '') {
        const name = tierName.toLowerCase();
        if (name.includes('plat')) return '💎';
        if (name.includes('gold')) return '🥇';
        if (name.includes('silv') || name.includes('sliv')) return '🥈';
        if (name.includes('bron')) return '🥉';
        if (name.includes('diam')) return '💎';
        if (name.includes('vip')) return '👑';
        return '🎖️';
    }
}

const loyaltyService = new LoyaltyService();
export default loyaltyService;
