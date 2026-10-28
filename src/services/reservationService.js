import api from '../api/api';

class ReservationService {
  // Create reservation
  async createReservation(reservationData) {
    try {
      const response = await api.post('/restaurant/reservations/create', reservationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get reservations by auth (supports Reservations_online boolean filter)
  async getReservationsByAuth(params = {}) {
    try {
      const response = await api.get('/restaurant/reservations/getbyauth', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all reservations (GET /api/v1/restaurant/reservations/getall)
  async getAllReservations(params = {}) {
    try {
      const response = await api.get('/restaurant/reservations/getall', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Export reservations to CSV (GET /api/v1/restaurant/reservations/export)
  async exportReservations(params = {}) {
    try {
      const response = await api.get('/restaurant/reservations/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get single reservation by ID
  async getReservationById(id) {
    try {
      const response = await api.get(`/restaurant/reservations/getbyid/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search/Filter reservations
  async searchReservations(params = {}) {
    try {
      const response = await api.get('/restaurant/reservations/search', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update reservation
  async updateReservation(reservationData) {
    try {
      const response = await api.put('/restaurant/reservations/update', reservationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete reservation
  async deleteReservation(id) {
    try {
      const response = await api.delete(`/restaurant/reservations/delete/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      const data = error.response.data;
      const validationErrors = Array.isArray(data?.errors)
        ? data.errors.map((e) => e.msg || e.message).filter(Boolean).join(', ')
        : '';
      return {
        message: validationErrors || data?.message || 'An error occurred',
        status: error.response.status,
        data
      };
    } else if (error.request) {
      return {
        message: 'No response from server. Please check your connection.',
        status: 0
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  }
}

export default new ReservationService();
