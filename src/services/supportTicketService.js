import api from '../api/api';

class SupportTicketService {
  // Get all support ticket types
  async getAllTicketTypes() {
    try {
      const response = await api.get('/restaurant/support_ticket_type/getall');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all support tickets (prioritize getbyauth for restaurant, fallback to getall)
  async getAllTickets() {
    try {
      const response = await api.get('/restaurant/support_ticket/getbyauth');
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data;
      }
      // Fallback to getall if getbyauth returns empty or if admin
      const fallback = await api.get('/restaurant/support_ticket/getall');
      return fallback.data;
    } catch (error) {
      try {
        const fallback = await api.get('/restaurant/support_ticket/getall');
        return fallback.data;
      } catch (fallbackError) {
        throw this.handleError(error);
      }
    }
  }

  // Get tickets by auth
  async getTicketsByAuth() {
    try {
      const response = await api.get('/restaurant/support_ticket/getbyauth');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get ticket by ID
  async getTicketById(id) {
    try {
      const response = await api.get(`/restaurant/support_ticket/getbyid/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create support ticket
  async createTicket(ticketData) {
    try {
      const response = await api.post('/restaurant/support_ticket/create', ticketData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all support ticket replies (optionally by ticket_id)
  async getAllTicketReplies(ticketId = null) {
    try {
      const config = ticketId ? { params: { ticket_id: ticketId } } : undefined;
      const response = await api.get('/restaurant/support_ticket_reply/getall', config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create support ticket reply
  async createTicketReply(replyData) {
    try {
      const response = await api.post('/restaurant/support_ticket_reply/create', replyData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update support ticket reply
  async updateTicketReply(replyData) {
    try {
      const response = await api.put('/restaurant/support_ticket_reply/update', replyData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data
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

export default new SupportTicketService();
