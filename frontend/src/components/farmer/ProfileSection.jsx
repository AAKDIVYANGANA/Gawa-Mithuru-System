import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import locations from '../../data/locations';

export default function ProfileSection() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const [form, setForm] = useState({
    fullName: '', address: '', district: '', dsDivision: '', phone: ''
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  const districts = Object.keys(locations);
  const dsDivisions = form.district ? locations[form.district] : [];

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        address: user.address || '',
        district: user.district || '',
        dsDivision: user.dsDivision || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleDistrictChange = (e) => {
    setForm({ ...form, district: e.target.value, dsDivision: '' });
  };

  const handleProfileUpdate = async () => {
    setFormError('');
    if (!form.fullName.trim()) return setFormError('සම්පූර්ණ නම ඇතුළත් කරන්න');
    if (!form.district) return setFormError('දිස්ත්‍රික්කය තෝරන්න');
    if (!form.dsDivision) return setFormError('DS කොට්ඨාශය තෝරන්න');
    if (form.phone && !/^0[0-9]{9}$/.test(form.phone))
      return setFormError('දුරකථන අංකය වලංගු නැත - උදා: 0771234567');

    setLoading(true);
    try {
      const res = await API.put('/auth/profile', form);
      const token = localStorage.getItem('token');

      if (form.phone && form.phone !== user.phone) {
        setMessage('✅ දුරකථන අංකය වෙනස් කරන ලදී. නැවත login කරන්න!');
        setTimeout(() => { logout(); navigate('/login'); }, 2000);
      } else {
        login(res.data.user, token);
        setMessage('✅ පැතිකඩ යාවත්කාලීන කරන ලදී');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'දෝෂයකි');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setFormError('');
    if (!pwForm.currentPassword) return setFormError('වර්තමාන මුරපදය ඇතුළත් කරන්න');
    if (!pwForm.newPassword) return setFormError('නව මුරපදය ඇතුළත් කරන්න');
    if (pwForm.newPassword.length < 6) return setFormError('නව මුරපදය අවම අකුරු 6ක් විය යුතුය');
    if (pwForm.newPassword !== pwForm.confirmPassword) return setFormError('මුරපද ගැලපෙන්නේ නැත');

    setLoading(true);
    try {
      await API.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      setMessage('✅ මුරපදය වෙනස් කරන ලදී. නැවත login කරන්න!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => { logout(); navigate('/login'); }, 2000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'වර්තමාන මුරපදය වැරදිය');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-green-700 mb-6">👤 පරිශීලක පැතිකඩ</h2>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
          👨‍🌾
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{user?.fullName}</h3>
          <p className="text-sm text-gray-500">📱 {user?.phone}</p>
          <p className="text-sm text-gray-500">📍 {user?.district} {user?.dsDivision ? `— ${user?.dsDivision}` : ''}</p>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
            ගොවියා
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => { setActiveTab('profile'); setFormError(''); setMessage(''); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'profile' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}>
          ✏️ පැතිකඩ යාවත්කාලීන කිරීම
        </button>
        <button onClick={() => { setActiveTab('password'); setFormError(''); setMessage(''); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'password' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}>
          🔒 මුරපදය වෙනස් කරන්න
        </button>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
          {message}
        </div>
      )}

      {/* Profile Edit Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">✏️ පෞද්ගලික තොරතුරු</h3>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
              ⚠️ {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">සම්පූර්ණ නම *</label>
              <input type="text" value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">දුරකථන අංකය</label>
              <input type="tel" value={form.phone} maxLength={10}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
              <p className="text-xs text-yellow-600 mt-1">⚠️ වෙනස් කළොත් නැවත Login සිදු වේ</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIC අංකය</label>
              <input type="text" value={user?.nic || ''} disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">NIC අංකය වෙනස් කළ නොහැක</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ලිපිනය</label>
              <input type="text" value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="ගොවිපළේ ලිපිනය"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">දිස්ත්‍රික්කය *</label>
              <select value={form.district} onChange={handleDistrictChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="">දිස්ත්‍රික්කය තෝරන්න</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* DS Division */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DS කොට්ඨාශය *</label>
              <select value={form.dsDivision}
                onChange={e => setForm({ ...form, dsDivision: e.target.value })}
                disabled={!form.district}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100">
                <option value="">DS කොට්ඨාශය තෝරන්න</option>
                {dsDivisions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {form.dsDivision && (
                <p className="text-xs text-blue-600 mt-1">
                  ⚠️ DS කොට්ඨාශය වෙනස් කළොත් LDO/Vet re-assign වේ
                </p>
              )}
            </div>
          </div>

          <button onClick={handleProfileUpdate} disabled={loading}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50">
            {loading ? '⏳ යාවත්කාලීන වෙමින්...' : '💾 යාවත්කාලීන කරන්න'}
          </button>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">🔒 මුරපදය වෙනස් කරන්න</h3>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
              ⚠️ {formError}
            </div>
          )}

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">වර්තමාන මුරපදය *</label>
              <input type="password" value={pwForm.currentPassword}
                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                placeholder="වර්තමාන මුරපදය"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">නව මුරපදය *</label>
              <input type="password" value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder="අවම අකුරු 6ක්"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">නව මුරපදය තහවුරු කරන්න *</label>
              <input type="password" value={pwForm.confirmPassword}
                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                placeholder="නව මුරපදය නැවත"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          </div>

          <button onClick={handlePasswordChange} disabled={loading}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50">
            {loading ? '⏳ වෙනස් වෙමින්...' : '🔒 මුරපදය වෙනස් කරන්න'}
          </button>
        </div>
      )}
    </div>
  );
}