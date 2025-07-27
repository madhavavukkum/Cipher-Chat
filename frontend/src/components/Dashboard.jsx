import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import ChatArea from './ChatArea.jsx';
import ProfileModal from './ProfileModal.jsx';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = 'https://cipher-chat.onrender.com/api';

function Dashboard({ user, setUser, socket }) {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const axiosInstance = axios.create({
      baseURL: BASE_URL,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    const fetchFriends = async () => {
      try {
        const response = await axiosInstance.get('/friends');
        setFriends(response.data);
      } catch (error) {
        toast.error('Failed to fetch friends');
      }
    };

    const fetchRequests = async () => {
      try {
        const response = await axiosInstance.get('/friends/requests');
        setRequests(response.data);
      } catch (error) {
        toast.error('Failed to fetch friend requests');
      }
    };

    fetchFriends();
    fetchRequests();

    socket.on('newMessage', (message) => {
      if (message.sender._id !== selectedFriend?._id) {
        toast.info(`New message from ${message.sender.username}`);
      }
      setFriends((prev) =>
        prev.map((friend) =>
          friend._id === message.sender._id
            ? { ...friend, lastMessage: message.message, unreadCount: (friend.unreadCount || 0) + 1 }
            : friend
        )
      );
    });

    socket.on('userOnline', ({ userId, username }) => {
      setFriends((prev) =>
        prev.map((friend) => (friend._id === userId ? { ...friend, isOnline: true } : friend))
      );
    });

    socket.on('userOffline', ({ userId }) => {
      setFriends((prev) =>
        prev.map((friend) => (friend._id === userId ? { ...friend, isOnline: false } : friend))
      );
    });

    socket.on('friendRequest', (request) => {
      setRequests((prev) => [...prev, request]);
      toast.info(`Friend request from ${request.sender.username}`);
    });

    return () => {
      socket.off('newMessage');
      socket.off('userOnline');
      socket.off('userOffline');
      socket.off('friendRequest');
    };
  }, [selectedFriend, socket]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    socket.disconnect();
    toast.success('Signed out successfully!');
    navigate('/login');
  };

  const handleSearch = async (query) => {
    try {
      const response = await axios.get(`${BASE_URL}/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSearchResults(response.data);
    } catch (error) {
      toast.error('Failed to search users');
    }
  };

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    setIsSidebarOpen(false);
    setFriends((prev) =>
      prev.map((f) => (f._id === friend._id ? { ...f, unreadCount: 0 } : f))
    );
  };

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        user={user}
        friends={friends}
        requests={requests}
        onSelectFriend={handleSelectFriend}
        onShowProfile={() => setShowProfile(true)}
        onShowNotifications={() => setShowNotifications(true)}
        onSearch={handleSearch}
        searchResults={searchResults}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      {selectedFriend ? (
        <ChatArea
          friend={selectedFriend}
          user={user}
          socket={socket}
          toggleSidebar={() => setIsSidebarOpen(true)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-whatsapp-light md:ml-64">
          <p className="text-gray-600">Select a chat to start messaging</p>
        </div>
      )}
      {showProfile && (
        <ProfileModal user={user} onClose={() => setShowProfile(false)} onUpdate={handleUpdateProfile} />
      )}
    </div>
  );
}

export default Dashboard;