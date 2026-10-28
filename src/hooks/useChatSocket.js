import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getCookie } from '../utils/cookies';

// You can read this from environment variables
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || (process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api/v1', '') : 'https://pos-backend-7xuw.onrender.com');

export const useChatSocket = (activeConversationId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    // Get token
    const token = getCookie('token');
    if (!token) return;

    // Initialize socket
    socketRef.current = io(SOCKET_URL, {
      auth: { token }
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle generic connection events
    socket.on('chat:connected', (payload) => {
      console.log('Chat Connected:', payload);
    });

    // Handle incoming messages
    socket.on('chat:message:new', (payload) => {
      console.log('New Message:', payload);
      // Append if it belongs to the active conversation or if it's a new direct chat we are viewing
      // We check if the incoming message's chat_conversation_id matches our active one
      if (
        activeConversationId && 
        payload.data && 
        payload.data.chat_conversation_id === activeConversationId
      ) {
        setMessages((prev) => [...prev, payload.data]);
        
        // Mark as read automatically when viewing
        socket.emit('chat:message:read', { chat_conversation_id: activeConversationId });
      }
    });

    socket.on('chat:message:read', (payload) => {
      console.log('Message read:', payload);
      // Here we could update UI to show read receipts for our own messages
    });

    socket.on('chat:typing', (payload) => {
      // payload: { chat_conversation_id, user_id, is_typing }
      if (payload.chat_conversation_id) {
        setTypingUsers(prev => ({
          ...prev,
          [payload.chat_conversation_id]: payload.is_typing
        }));
      }
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [activeConversationId]); // Re-evaluate if active conversation changes to handle new routing logic

  // Actions
  const joinChat = (chatId) => {
    if (socketRef.current && chatId) {
      socketRef.current.emit('chat:join', { chat_conversation_id: chatId });
    }
  };

  const sendMessage = (payload) => {
    return new Promise((resolve) => {
      if (socketRef.current) {
        socketRef.current.emit('chat:message:send', payload, (response) => {
          if (response && response.success) {
            // If it's a new direct chat, it might return a chat_conversation_id we didn't have
            resolve(response);
          }
        });
      } else {
        resolve({ success: false, message: 'Socket not connected' });
      }
    });
  };

  const sendTyping = (chatId, isTyping) => {
    if (socketRef.current && chatId) {
      socketRef.current.emit('chat:typing', {
        chat_conversation_id: chatId,
        is_typing: isTyping
      });
    }
  };

  const markAsRead = (chatId) => {
    if (socketRef.current && chatId) {
      socketRef.current.emit('chat:message:read', { chat_conversation_id: chatId });
    }
  };

  // Allow setting initial messages from REST API
  const setInitialMessages = (initialMessages) => {
    setMessages(initialMessages);
  };

  return {
    isConnected,
    socket: socketRef.current,
    messages,
    typingUsers,
    setInitialMessages,
    joinChat,
    sendMessage,
    sendTyping,
    markAsRead
  };
};
