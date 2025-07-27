import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = 'https://cipher-chat.onrender.com/api';

function ChatArea({ friend, user, socket, toggleSidebar }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const axiosInstance = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    const fetchMessages = async () => {
      try {
        const response = await axiosInstance.get(`/messages/${friend._id}`);
        setMessages(response.data.messages);
        socket.emit('markAsRead', { messageIds: response.data.messages.filter((m) => !m.isRead).map((m) => m._id) });
      } catch (error) {
        toast.error('Failed to fetch messages');
      }
    };

    fetchMessages();

    socket.on('newMessage', (message) => {
      if (message.sender._id === friend._id || message.receiver._id === friend._id) {
        setMessages((prev) => [...prev, message]);
        socket.emit('markAsRead', { messageIds: [message._id] });
      }
    });

    socket.on('userTyping', ({ userId, isTyping }) => {
      if (userId === friend._id) {
        setTyping(isTyping);
      }
    });

    return () => {
      socket.off('newMessage');
      socket.off('userTyping');
    };
  }, [friend, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      socket.emit('sendMessage', {
        receiverId: friend._id,
        message: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket.emit('typing', { receiverId: friend._id, isTyping: true });
    setTimeout(() => socket.emit('typing', { receiverId: friend._id, isTyping: false }), 3000);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${BASE_URL}/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-whatsapp-light md:ml-64">
      <div className="flex items-center p-4 bg-whatsapp-dark text-white">
        <button className="md:hidden mr-4" onClick={toggleSidebar}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-2">
          {friend.username[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{friend.username}</p>
          <p className="text-sm">{friend.isOnline ? 'Online' : 'Offline'}</p>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`mb-2 max-w-xs p-2 rounded-lg ${
              msg.sender._id === user._id
                ? 'ml-auto bg-whatsapp-green text-white'
                : 'mr-auto bg-white border'
            }`}
          >
            <p>{msg.message}</p>
            <p className="text-xs text-gray-500">
              {new Date(msg.timestamp).toLocaleTimeString()}
              {msg.sender._id === user._id && (
                <button
                  onClick={() => handleDeleteMessage(msg._id)}
                  className="ml-2 text-red-500"
                >
                  Delete
                </button>
              )}
            </p>
          </div>
        ))}
        {typing && <p className="text-sm text-gray-500">Typing...</p>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l"
          />
          <button type="submit" className="bg-whatsapp-green text-white p-2 rounded-r">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatArea;