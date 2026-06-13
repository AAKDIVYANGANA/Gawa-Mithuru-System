import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message || '';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { identifier, password });
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      if (role === 'farmer') navigate('/farmer', { replace: true });
      else if (role === 'ldo') navigate('/ldo', { replace: true });
      else if (role === 'vet') navigate('/vet', { replace: true });
      else if (role === 'admin') navigate('/admin', { replace: true });
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

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ✅ {successMessage}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              දුරකථන අංකය / Email
            </label>
            <input type="text" value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="දුරකථන අංකය හෝ Email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              මුරපදය
            </label>
            <input type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="මුරපදය ඇතුළත් කරන්න"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-50">
            {loading ? '⏳ පිවිසෙමින්...' : 'පිවිසෙන්න'}
          </button>
        </form>

        {/* Role hints */}
        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
          <p>👨‍🌾 <span className="font-medium">ගොවියා:</span> දුරකථන අංකය භාවිතා කරන්න</p>
          <p>👨‍💼 <span className="font-medium">LDO / 👨‍⚕️ Vet / ⚙️ Admin:</span> Email භාවිතා කරන්න</p>
        </div>

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