import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = 'https://cipher-chat.onrender.com/api';

function Sidebar({
  user,
  friends,
  requests,
  onSelectFriend,
  onShowProfile,
  onShowNotifications,
  onSearch,
  searchResults,
  onLogout,
  isSidebarOpen,
  toggleSidebar,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await axios.post(
        `${BASE_URL}/friends/request`,
        { userId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Friend request sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    try {
      await axios.post(
        `${BASE_URL}/friends/request/respond`,
        { requestId, action },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success(`Friend request ${action}ed!`);
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
      if (action === 'accept') {
        const newFriend = requests.find((req) => req._id === requestId).sender;
        setFriends((prev) => [...prev, newFriend]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} friend request`);
    }
  };

  return (
    <div
      className={`fixed md:static inset-y-0 left-0 w-64 bg-gray-100 p-4 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 z-20`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-whatsapp-dark">Chats</h2>
        <button className="md:hidden" onClick={toggleSidebar}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex space-x-2 mb-4">
        <button onClick={onShowProfile} className="p-2 hover:bg-gray-200 rounded">
          <svg className="w-6 h-6 text-whatsapp-dark" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-6 2.67-6 6v2h12v-2c0-3.33-2.67-6-6-6z" />
          </svg>
        </button>
        <button onClick={onShowNotifications} className="p-2 hover:bg-gray-200 rounded relative">
          <svg className="w-6 h-6 text-whatsapp-dark" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          {requests.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {requests.length}
            </span>
          )}
        </button>
        <button onClick={() => setShowSearch(!showSearch)} className="p-2 hover:bg-gray-200 rounded">
          <svg className="w-6 h-6 text-whatsapp-dark" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </button>
      </div>
      {showSearch && (
        <div className="mb-4">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full p-2 border rounded"
            />
          </form>
          {searchResults.length > 0 && (
            <ul className="mt-2 max-h-40 overflow-y-auto">
              {searchResults.map((result) => (
                <li key={result._id} className="p-2 hover:bg-gray-200 flex justify-between items-center">
                  <span>{result.username}</span>
                  <button
                    onClick={() => handleSendRequest(result._id)}
                    className="bg-whatsapp-green text-white px-2 py-1 rounded text-sm"
                  >
                    Add Friend
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {showNotifications && (
        <div className="mb-4">
          <h3 className="font-bold mb-2">Friend Requests</h3>
          {requests.length === 0 ? (
            <p className="text-gray-600">No pending requests</p>
          ) : (
            <ul className="max-h-40 overflow-y-auto">
              {requests.map((req) => (
                <li key={req._id} className="p-2 hover:bg-gray-200 flex justify-between items-center">
                  <span>{req.sender.username}</span>
                  <div>
                    <button
                      onClick={() => handleRespondRequest(req._id, 'accept')}
                      className="bg-whatsapp-green text-white px-2 py-1 rounded text-sm mr-2"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondRequest(req._id, 'reject')}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <ul className="overflow-y-auto">
        {friends.map((friend) => (
          <li
            key={friend._id}
            onClick={() => onSelectFriend(friend)}
            className="p-2 hover:bg-gray-200 cursor-pointer flex justify-between items-center"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                {friend.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{friend.username}</p>
                <p className="text-sm text-gray-600 truncate w-36">{friend.lastMessage || 'No messages'}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              {friend.isOnline && (
                <span className="w-2 h-2 bg-green-500 rounded-full mb-1"></span>
              )}
              {friend.unreadCount > 0 && (
                <span className="bg-whatsapp-green text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {friend.unreadCount}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={onLogout}
        className="w-full mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;