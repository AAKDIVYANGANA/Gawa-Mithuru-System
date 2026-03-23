import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    nic: '',
    phone: '',
    address: '',
    district: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const districts = [
    'කොළඹ', 'ගම්පහ', 'කළුතර', 'කන්දි', 'මාතලේ', 'නුවරඑළිය',
    'ගාල්ල', 'මාතර', 'හම්බන්තොට', 'යාපනය', 'කිළිනොච්චි',
    'මන්නාරම', 'වවුනියාව', 'මුලතිව්', 'තිඹිරිගස්යාය', 'අම්පාර',
    'ත්‍රිකුණාමළය', 'කුරුණෑගල', 'පුත්තලම', 'අනුරාධපුරය',
    'පොළොන්නරුව', 'බදුල්ල', 'මොනරාගල', 'රත්නපුර', 'කෑගල්ල'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!formData.fullName.trim()) return setError('සම්පූර්ණ නම ඇතුළත් කරන්න');
    if (!formData.nic.trim()) return setError('NIC අංකය ඇතුළත් කරන්න');
    if (!formData.phone.trim()) return setError('දුරකථන අංකය ඇතුළත් කරන්න');
    if (!/^0[0-9]{9}$/.test(formData.phone)) return setError('දුරකථන අංකය වලංගු නැත - උදා: 0771234567 (ඉලක්කම් 10ක්)');
    if (!formData.address.trim()) return setError('ලිපිනය ඇතුළත් කරන්න');
    if (!formData.district) return setError('දිස්ත්‍රික්කය තෝරන්න');
    if (!formData.password) return setError('මුරපදය ඇතුළත් කරන්න');
    if (formData.password.length < 6) return setError('මුරපදය අවම වශයෙන් අකුරු 6ක් විය යුතුය');
    if (formData.password !== formData.confirmPassword) return setError('මුරපද දෙක ගැලපෙන්නේ නෑ');

    setLoading(true);
    try {
      await API.post('/auth/register', {
        fullName: formData.fullName,
        nic: formData.nic,
        phone: formData.phone,
        address: formData.address,
        district: formData.district,
        password: formData.password
      });
      setSuccess('ලියාපදිංචිය සාර්ථකයි! පිවිසෙන්න.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'ලියාපදිංචිය අසාර්ථකයි');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🐄</div>
          <h1 className="text-2xl font-bold text-green-700">ගව මිතුරු</h1>
          <p className="text-gray-500 text-sm">නව ගොවි ලියාපදිංචිය</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-600 px-4 py-2 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">සම්පූර්ණ නම</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
              placeholder="ඔබේ සම්පූර්ණ නම" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIC අංකය</label>
            <input type="text" name="nic" value={formData.nic} onChange={handleChange}
              placeholder="NIC අංකය" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">දුරකථන අංකය</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
              placeholder="07XXXXXXXX" required maxLength={10}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            <p className="text-gray-400 text-xs mt-1">ඉලක්කම් 10ක් ඇතුළත් කරන්න (උදා: 0771234567)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ලිපිනය</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange}
              placeholder="ගොවිපළේ ලිපිනය" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">දිස්ත්‍රික්කය</label>
            <select name="district" value={formData.district} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="">දිස්ත්‍රික්කය තෝරන්න</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">මුරපදය</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder="අවම අකුරු 6ක්" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">මුරපදය තහවුරු කරන්න</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              placeholder="මුරපදය නැවත ඇතුළත් කරන්න" required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-200">
            {loading ? 'ලියාපදිංචි වෙමින්...' : 'ලියාපදිංචි වන්න'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          දැනටමත් ගිණුමක් තිබේද?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">
            පිවිසෙන්න
          </Link>
        </p>
      </div>
    </div>
  );
}