import api from "../api/api";

const slotsService = {
    // Get configured slots for the authenticated restaurant
    getSlotsByAuth: async () => {
        try {
            const response = await api.get('/restaurant/restaurant_slot/items');
            return response.data;
        } catch (error) {
            console.error('Error fetching slots:', error);
            throw error;
        }
    },

    // Create a configured slot
    createSlots: async (slotsData) => {
        try {
            const response = await api.post('/restaurant/restaurant_slot/items', slotsData);
            return response.data;
        } catch (error) {
            console.error('Error creating slots:', error);
            throw error;
        }
    },

    // Update a configured slot by ID
    updateSlots: async (id, slotsData) => {
        try {
            const response = await api.put(`/restaurant/restaurant_slot/items/${id}`, slotsData);
            return response.data;
        } catch (error) {
            console.error('Error updating slots:', error);
            throw error;
        }
    },

    // Get generated slots (optionally filtered by table_id)
    getGeneratedSlots: async (tableId = null) => {
        try {
            const params = tableId ? { table_id: tableId } : {};
            const response = await api.get('/restaurant/restaurant_slot/generated', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching generated slots:', error);
            throw error;
        }
    },

    // Delete a configured slot by ID
    deleteSlot: async (id) => {
        try {
            const response = await api.delete(`/restaurant/restaurant_slot/items/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting slot:', error);
            throw error;
        }
    },

    // Configure Availability / Slot Generator (POST /restaurant/store_details/save)
    saveAvailability: async (availabilityData) => {
        try {
            const response = await api.post('/restaurant/store_details/save', availabilityData);
            return response.data;
        } catch (error) {
            console.error('Error saving availability:', error);
            throw error;
        }
    }
};

export default slotsService;
