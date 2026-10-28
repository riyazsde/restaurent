import api from '../api/api';
import { API_ENDPOINTS } from '../utils/constants';

class NotesService {
  /**
   * Fetch all restaurant service & kitchen notes
   * GET /api/v1/restaurant/notes
   */
  async getNotes() {
    try {
      const response = await api.get(API_ENDPOINTS.RESTAURANT_NOTES);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new note
   * POST /api/v1/restaurant/notes
   * @param {Object|string} noteData - { note, table_id, order_id } or note string
   */
  async createNote(noteData) {
    try {
      const payload = typeof noteData === 'string' ? { note: noteData } : noteData;
      const response = await api.post(API_ENDPOINTS.RESTAURANT_NOTES, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing note (e.g. toggle completion or edit content)
   * PATCH /api/v1/restaurant/notes/:id
   * @param {string|number} id
   * @param {Object} noteData - { note, completed }
   */
  async updateNote(id, noteData) {
    try {
      const response = await api.patch(`${API_ENDPOINTS.RESTAURANT_NOTES}/${id}`, noteData);
      return response.data;
    } catch (error) {
      // Fallback to PUT if backend router uses PUT
      try {
        const fallback = await api.put(`${API_ENDPOINTS.RESTAURANT_NOTES}/${id}`, noteData);
        return fallback.data;
      } catch {
        throw this.handleError(error);
      }
    }
  }

  /**
   * Delete a note
   * DELETE /api/v1/restaurant/notes/:id (with dual fallback to GET as in Postman collection)
   * @param {string|number} id
   */
  async deleteNote(id) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.RESTAURANT_NOTES}/${id}`);
      return response.data;
    } catch (error) {
      // Dual fallback to GET as specifically documented in the Postman collection
      try {
        const fallback = await api.get(`${API_ENDPOINTS.RESTAURANT_NOTES}/${id}`);
        return fallback.data;
      } catch {
        throw this.handleError(error);
      }
    }
  }

  handleError(error) {
    const message = error.response?.data?.message || error.message || 'Operation failed';
    return new Error(message);
  }
}

export const notesService = new NotesService();
export default notesService;
