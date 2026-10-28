import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import chatService from '../../services/chatService';
import { useChatSocket } from '../../hooks/useChatSocket';
import { Search, SlidersHorizontal, Send, User, MoreVertical, Phone, Video } from 'lucide-react';

const ChatListItem = ({ chat, isActive, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`flex items-center justify-between p-4 cursor-pointer border-b border-gray-50 transition-colors ${isActive ? 'bg-[#fdf0f4]' : 'hover:bg-gray-50'}`}
        >
            <div className="flex items-center space-x-3 overflow-hidden">
                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-2xl ${chat.avatarColor}`}>
                    {chat.icon || '👩🏽‍🍳'}
                </div>
                <div className="overflow-hidden">
                    <h4 className="text-[14px] font-bold text-gray-900 truncate">{chat.name}</h4>
                    <p className={`text-[12px] truncate mt-0.5 ${chat.isTyping ? 'text-[#8e24aa] italic' : 'text-gray-500'}`}>
                        {chat.isTyping ? 'Typing...' : chat.message}
                    </p>
                </div>
            </div>
            <div className="flex flex-col items-end flex-shrink-0 ml-2 space-y-1.5">
                <span className="text-[10px] font-medium text-gray-400">{chat.time}</span>
                {chat.unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-[#1e293b] flex items-center justify-center text-white text-[10px] font-bold">
                        {chat.unread}
                    </div>
                )}
            </div>
        </div>
    );
};

const ChatWindow = ({ chat, chatSocket }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Fetch initial history
    const { data: messagesResp, isLoading } = useQuery({
        queryKey: ['chatMessages', chat.id],
        queryFn: () => chatService.getMessages(chat.id),
        enabled: !!chat.id
    });

    useEffect(() => {
        if (messagesResp?.data) {
            chatSocket.setInitialMessages(messagesResp.data);
        }
    }, [messagesResp]);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatSocket.messages]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        
        const payload = {
            chat_conversation_id: chat.id,
            message_type: 'text',
            message: newMessage,
            client_message_id: `socket-${chat.id}-${Date.now()}`
        };
        
        // Optimistic append
        chatSocket.setInitialMessages(prev => [...prev, { ...payload, is_mine: true, created_at: new Date().toISOString() }]);
        setNewMessage('');
        
        await chatSocket.sendMessage(payload);
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        chatSocket.sendTyping(chat.id, e.target.value.length > 0);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#fafafa]">
            {/* Chat Header */}
            <div className="h-[72px] bg-white border-b border-gray-100 px-6 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${chat.avatarColor}`}>
                        {chat.icon || '👩🏽‍🍳'}
                    </div>
                    <div>
                        <h3 className="text-[15px] font-bold text-gray-900">{chat.name}</h3>
                        <p className="text-[12px] text-green-500 font-medium">
                            {chatSocket.typingUsers[chat.id] ? 'Typing...' : 'Online'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                    <button className="p-2 hover:bg-gray-50 rounded-full transition-colors"><Phone className="w-5 h-5" /></button>
                    <button className="p-2 hover:bg-gray-50 rounded-full transition-colors"><Video className="w-5 h-5" /></button>
                    <button className="p-2 hover:bg-gray-50 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center text-sm text-gray-400">Loading messages...</div>
                ) : chatSocket.messages.length === 0 ? (
                    <div className="flex justify-center text-sm text-gray-400">No messages yet. Say hello!</div>
                ) : (
                    chatSocket.messages.map((msg, idx) => {
                        const isMine = msg.is_mine || msg.sender_id === 'ME'; // Adjust based on API structure
                        return (
                            <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-gradient-to-r from-[#8e24aa] to-[#d32f2f] text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'}`}>
                                    <p className="text-[14px]">{msg.message}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-pink-100' : 'text-gray-400'}`}>
                                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center space-x-2 bg-[#f9fafb] p-2 rounded-full border border-gray-100 focus-within:border-pink-200 focus-within:shadow-inner transition-all">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message here..."
                        className="flex-1 bg-transparent border-none px-4 py-1 text-[14px] text-gray-700 outline-none"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#8e24aa] to-[#d32f2f] text-white disabled:opacity-50 transition-opacity shadow-sm"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const EmployeeTeamChats = () => {
    const [filter, setFilter] = useState('All');
    const [activeChatId, setActiveChatId] = useState(null);
    const filters = ['All', 'Waiters', 'Chefs', 'Managers'];

    const chatSocket = useChatSocket(activeChatId);

    const { data: conversationsResp, isLoading } = useQuery({
        queryKey: ['teamChats', filter],
        queryFn: () => {
            const type = filter === 'All' ? '' : filter.toLowerCase();
            return chatService.getConversations('', type);
        }
    });

    const apiChats = conversationsResp?.data || [];

    const chats = apiChats.map(c => ({
        id: c.id || c.chat_conversation_id,
        name: c.group_name || c.name || 'Team Triaxx',
        message: c.last_message || 'No messages yet',
        time: c.time || 'Just now',
        unread: c.unread_count || 0,
        avatarColor: 'bg-[#fde047]',
        isTyping: chatSocket.typingUsers[c.id || c.chat_conversation_id] || false,
        original: c
    }));

    const activeChat = chats.find(c => c.id === activeChatId);

    const handleChatSelect = (chatId) => {
        setActiveChatId(chatId);
        chatSocket.joinChat(chatId);
    };

    return (
        <div className="h-full flex flex-col font-sans px-8 py-6 max-h-screen overflow-hidden">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-bold text-gray-900">Team Chats</h1>
                    {chatSocket.isConnected ? (
                        <div className="flex items-center space-x-1.5 bg-[#dcfce7] px-3 py-1 rounded-full border border-[#86efac]">
                            <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></div>
                            <span className="text-[11px] font-bold text-[#16a34a]">Live</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-1.5 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span className="text-[11px] font-bold text-gray-500">Connecting...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area - Split Pane */}
            <div className="flex-1 overflow-hidden bg-white rounded-[24px] shadow-sm border border-gray-100 flex">
                
                {/* Left Pane - Chat List */}
                <div className="w-[380px] flex flex-col border-r border-gray-100 flex-shrink-0">
                    
                    {/* Search & Filter */}
                    <div className="p-5 pb-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Search Team" 
                                    className="w-full bg-[#f9fafb] border-none rounded-full py-2.5 pl-9 pr-4 text-[13px] text-gray-700 outline-none focus:ring-1 focus:ring-pink-200 shadow-inner"
                                />
                            </div>
                            <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                                <SlidersHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Filter Pills */}
                        <div className="flex space-x-2">
                            {filters.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setFilter(opt)}
                                    className={`px-4 py-1.5 text-[12px] font-semibold rounded-full transition-all ${
                                        filter === opt
                                            ? 'bg-gradient-to-r from-[#8e24aa] to-[#d32f2f] text-white shadow-sm'
                                            : 'bg-[#fdf0f4] text-[#8e24aa] hover:bg-[#fce7ec]'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="p-8 text-center text-gray-400 text-sm">Loading chats...</div>
                        ) : chats.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">No conversations found</div>
                        ) : (
                            chats.map((chat, idx) => (
                                <ChatListItem 
                                    key={idx} 
                                    chat={chat} 
                                    isActive={activeChatId === chat.id}
                                    onClick={() => handleChatSelect(chat.id)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Right Pane - Chat Window / Empty State */}
                {activeChat ? (
                    <ChatWindow chat={activeChat} chatSocket={chatSocket} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#fafafa]">
                        <div className="text-center space-y-1">
                            <p className="text-[15px] font-semibold text-gray-600">
                                Send and Receive message without any interruption
                            </p>
                            <p className="text-[15px] font-semibold text-gray-600">
                                Message your team for any assistance or help required
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeTeamChats;
