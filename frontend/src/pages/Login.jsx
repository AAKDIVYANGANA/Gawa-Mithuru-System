import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import API from '../utils/api';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { identifier, password });
      login(res.data.user, res.data.token);
      if (res.data.user.role === 'farmer') navigate('/farmer');
      else if (res.data.user.role === 'ldo') navigate('/ldo');
      else if (res.data.user.role === 'vet') navigate('/vet');
    } catch (err) {
      setError(err.response?.data?.message || 'පිවිසීම අසාර්ථකයි');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🐄</div>
          <h1 className="text-2xl font-bold text-green-700">ගව මිතුරු</h1>
          <p className="text-gray-500 text-sm">පශු සම්පත් කළමනාකරණ පද්ධතිය</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              දුරකථන අංකය / Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="දුරකථන අංකය හෝ Email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              මුරපදය
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="මුරපදය ඇතුළත් කරන්න"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            {loading ? 'පිවිසෙමින්...' : 'පිවිසෙන්න'}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-500 mt-4">
          ලියාපදිංචි නොවූවාද?{' '}
          <Link to="/register" className="text-green-600 font-medium hover:underline">
            ගොවියෙකු ලෙස ලියාපදිංචි වන්න
          </Link>
        </p>
      </div>
    </div>
  );
}