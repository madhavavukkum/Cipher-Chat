import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = 'https://cipher-chat.onrender.com/api';

function Login({ setUser, socket }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      socket.auth = { token: response.data.token };
      socket.connect();
      toast.success('Signed in successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-whatsapp-dark">Login</h2>
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border rounded"
            required
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-whatsapp-green text-white p-2 rounded hover:bg-green-600"
          >
            Login
          </button>
        </div>
        <p className="mt-4 text-center">
          Don't have an account? <Link to="/signup" className="text-whatsapp-green">Sign Up</Link>
        </p>
        <p className="mt-2 text-center">
          <Link to="/guest" className="text-whatsapp-green">Login as Guest</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;