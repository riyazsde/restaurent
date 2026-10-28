import api from '../api/api';

class ChatService {
  // Get all conversations
  async getConversations(search = '', type = '') {
    try {
      let query = '';
      if (search || type) {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (type) params.append('type', type);
        query = `?${params.toString()}`;
      }
      const response = await api.get(`/restaurant/chat/conversations/getall${query}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get conversation by ID
  async getConversationById(id) {
    try {
      const response = await api.get(`/restaurant/chat/conversations/getbyid/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get messages for a conversation
  async getMessages(conversationId, page = 1, limit = 30) {
    try {
      const response = await api.get(`/restaurant/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create a group chat
  async createGroupChat(data) {
    try {
      const response = await api.post('/restaurant/chat/conversations/create', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Archive a conversation
  async archiveConversation(id) {
    try {
      const response = await api.delete(`/restaurant/chat/conversations/archive/${id}`);
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

const chatService = new ChatService();
export default chatService;
