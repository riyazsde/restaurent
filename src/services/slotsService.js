import api from "../api/api";

const slotsService = {
    // Get slots by authenticated user
    getSlotsByAuth: async () => {
        try {
            const response = await api.get('/restaurant/restaurant_slot/getbyauth');
            return response.data;
        } catch (error) {
            console.error('Error fetching slots:', error);
            throw error;
        }
    },

    // Create new slots
    createSlots: async (slotsData) => {
        try {
            const response = await api.post('/restaurant/restaurant_slot/create', slotsData);
            return response.data;
        } catch (error) {
            console.error('Error creating slots:', error);
            throw error;
        }
    },

    // Update existing slots
    updateSlots: async (slotsData) => {
        try {
            const response = await api.put('/restaurant/restaurant_slot/update', slotsData);
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

    // Delete slot by ID (DELETE /restaurant/restaurant_slot/delete/:id)
    deleteSlot: async (id) => {
        try {
            const response = await api.delete(`/restaurant/restaurant_slot/delete/${id}`);
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
