import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = 'https://cipher-chat.onrender.com/api';

function GuestLogin({ setUser, socket }) {
  const navigate = useNavigate();

  const handleGuestLogin = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/guest`);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      socket.auth = { token: response.data.token };
      socket.connect();
      toast.success('Logged in as guest!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Guest login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-whatsapp-dark">Guest Login</h2>
        <button
          onClick={handleGuestLogin}
          className="w-full bg-whatsapp-green text-white p-3 rounded-lg hover:bg-green-600"
        >
          Login as Guest
        </button>
        <p className="mt-4 text-center">
          Want a full account? <Link to="/signup" className="text-whatsapp-green">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default GuestLogin;