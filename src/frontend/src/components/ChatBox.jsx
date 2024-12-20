import React, { useState, useRef, useEffect } from 'react';
import { createChat, getChatMessages, sendMessage } from '../api';
import '../page_styles/chat_box.css';

const ChatBox = ({ 
  booking_id, 
  onClose, 
  provider_id = null, 
  client_id = null,
  provider_name = null,
  client_name = null,
  currentUserId = null,
  currentUserType = null
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  const chatPartnerName = currentUserType === 'CLIENT' ? provider_name : client_name;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        console.log('Initializing chat with params:', {
          provider_id,
          client_id,
          booking_id
        });

        const params = {
          provider_id: provider_id?.toString(),
          client_id: client_id?.toString(),
          booking_id: booking_id?.toString()
        };
        
        // Create or get existing chat
        const chat = await createChat(params);
        console.log('Created/Retrieved chat:', chat);
        
        if (!chat?.id) {
          throw new Error('No chat ID received');
        }
        
        setChatId(chat.id);
        
        // Fetch existing messages
        console.log('Fetching messages for chat:', chat.id);
        const chatMessages = await getChatMessages(chat.id);
        console.log('Retrieved messages:', chatMessages);
        setMessages(chatMessages || []);
      } catch (err) {
        console.error('Error in chat initialization:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (booking_id && (provider_id || client_id)) {
      console.log('Starting chat initialization with:', {
        booking_id,
        provider_id,
        client_id
      });
      initializeChat();
    } else {
      console.log('Missing required chat parameters:', {
        booking_id,
        provider_id,
        client_id
      });
    }
  }, [booking_id, provider_id, client_id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    try {
      const sentMessage = await sendMessage(chatId, newMessage.trim());
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <div className="chat-box">
        <div className="chat-loading">
          <span className="loading-spinner"></span>
          Loading chat...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-box">
        <div className="chat-error">
          Error loading chat: {error}
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>Chat with {chatPartnerName}</h3>
        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="chat-messages">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.sender_id === currentUserId ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              <p>{message.content}</p>
            </div>
            <div className="message-info">
              <span className="message-date">
                {new Date(message.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true
                })}
              </span>
              {message.sender_id === currentUserId && (
                <div className="message-status">
                  {message.read ? (
                    <i className="fas fa-check-double read" title="Read"></i>
                  ) : (
                    <i className="fas fa-check unread" title="Sent"></i>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input" onSubmit={handleSendMessage}>
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${chatPartnerName}...`}
          disabled={!chatId}
        />
        <button 
          type="submit" 
          className="send-btn"
          disabled={!newMessage.trim() || !chatId}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default ChatBox; 