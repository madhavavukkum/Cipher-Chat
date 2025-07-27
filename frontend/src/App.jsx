import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import GuestLogin from './components/GuestLogin.jsx';
import Dashboard from './components/Dashboard.jsx';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const BASE_URL = 'https://cipher-chat.onrender.com';
const socket = io(BASE_URL, { autoConnect: false });

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      socket.auth = { token: localStorage.getItem('token') };
      socket.connect();
    }
    return () => socket.disconnect();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} socket={socket} />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup setUser={setUser} socket={socket} />} />
        <Route path="/guest" element={user ? <Navigate to="/dashboard" /> : <GuestLogin setUser={setUser} socket={socket} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} setUser={setUser} socket={socket} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;