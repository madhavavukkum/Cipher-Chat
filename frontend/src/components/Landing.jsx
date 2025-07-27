import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-whatsapp-dark">Cipher Chat</h1>
      <p className="text-lg mb-8 text-gray-600">Secure, real-time messaging with end-to-end encryption</p>
      <div className="space-y-4 w-full max-w-xs">
        <Link to="/login">
          <button className="w-full bg-whatsapp-green text-white p-3 rounded-lg hover:bg-green-600">
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button className="w-full bg-whatsapp-green text-white p-3 rounded-lg hover:bg-green-600">
            Sign Up
          </button>
        </Link>
        <Link to="/guest">
          <button className="w-full bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600">
            Guest Login
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Landing;