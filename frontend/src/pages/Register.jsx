import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import locations from '../data/locations';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', nic: '', phone: '', address: '',
    district: '', dsDivision: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const districts = Object.keys(locations);
  const dsDivisions = form.district ? locations[form.district] : [];

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'සම්පූර්ණ නම ඇතුළත් කරන්න';
    if (!form.nic.trim()) e.nic = 'NIC අංකය ඇතුළත් කරන්න';
    else if (!/^\d{9}[vVxX]$|^\d{12}$/.test(form.nic)) e.nic = 'NIC අංකය නිවැරදි නැත (9 + V/X හෝ 12 ඉලක්කම්)';
    if (!form.phone.trim()) e.phone = 'දුරකථන අංකය ඇතුළත් කරන්න';
    else if (!/^0\d{9}$/.test(form.phone)) e.phone = 'දුරකථන අංකය නිවැරදි නැත (07XXXXXXXX)';
    if (!form.district) e.district = 'දිස්ත්‍රික්කය තෝරන්න';
    if (!form.dsDivision) e.dsDivision = 'DS කොට්ඨාශය තෝරන්න';
    if (!form.password) e.password = 'මුරපදය ඇතුළත් කරන්න';
    else if (form.password.length < 6) e.password = 'මුරපදය අවම වශයෙන් අකුරු 6ක් විය යුතුය';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'මුරපද දෙක ගැලපෙන්නේ නැත';
    return e;
  };

  const handleDistrictChange = (e) => {
    setForm({ ...form, district: e.target.value, dsDivision: '' });
    if (errors.district) setErrors({ ...errors, district: '', dsDivision: '' });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    try {
      const res = await API.post('/auth/register', {
        fullName: form.fullName,
        nic: form.nic,
        phone: form.phone,
        address: form.address,
        district: form.district,
        dsDivision: form.dsDivision,
        password: form.password,
      });

      let msg = 'ලියාපදිංචිය සාර්ථකයි!';
      if (res.data.assignedLDO) msg += ' ✅ LDO නිලධාරියෙකු assign කරන ලදී.';
      else msg += ' ⚠️ ඔබේ DS Division සඳහා LDO නිලධාරියෙකු තවම assign නොවී ඇත.';
      if (res.data.assignedVet) msg += ' ✅ පශු වෛද්‍යවරයෙකු assign කරන ලදී.';
      else msg += ' ⚠️ ඔබේ DS Division සඳහා පශු වෛද්‍යවරයෙකු තවම assign නොවී ඇත.';

      navigate('/login', { state: { message: msg } });
    } catch (err) {
      setServerError(err.response?.data?.message || 'ලියාපදිංචිය අසාර්ථකයි');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐄</div>
          <h1 className="text-2xl font-bold text-green-700">ගව මිතුරු</h1>
          <p className="text-gray-500 text-sm mt-1">නව ගොවි ගිණුමක් සාදන්න</p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
            ⚠️ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">සම්පූර්ණ නම *</label>
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
              placeholder="ඔබේ සම්පූර්ණ නම"
              className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.fullName ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* NIC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIC අංකය *</label>
            <input type="text" name="nic" value={form.nic} onChange={handleChange}
              placeholder="123456789V හෝ 123456789012"
              className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.nic ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.nic && <p className="text-red-500 text-xs mt-1">{errors.nic}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">දුරකථන අංකය *</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange}
              placeholder="07XXXXXXXX"
              className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.phone ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ලිපිනය</label>
            <input type="text" name="address" value={form.address} onChange={handleChange}
              placeholder="ගෙදර ලිපිනය"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">දිස්ත්‍රික්කය *</label>
            <select name="district" value={form.district} onChange={handleDistrictChange}
              className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.district ? 'border-red-400' : 'border-gray-300'}`}>
              <option value="">දිස්ත්‍රික්කය තෝරන්න</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
          </div>

          {/* DS Division */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DS කොට්ඨාශය *</label>
            <select name="dsDivision" value={form.dsDivision}
              onChange={e => {
                setForm({ ...form, dsDivision: e.target.value });
                if (errors.dsDivision) setErrors({ ...errors, dsDivision: '' });
              }}
              disabled={!form.district}
              className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100 ${errors.dsDivision ? 'border-red-400' : 'border-gray-300'}`}>
              <option value="">DS කොට්ඨාශය තෝරන්න</option>
              {dsDivisions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.dsDivision && <p className="text-red-500 text-xs mt-1">{errors.dsDivision}</p>}
          </div>

          {/* DS Division Info */}
          {form.dsDivision && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
              📍 ඔබේ DS කොට්ඨාශය අනුව LDO නිලධාරියෙකු සහ පශු වෛද්‍යවරයෙකු ස්වයංක්‍රීයව assign කරනු ලැබේ.
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">මුරපදය *</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="අවම අකුරු 6ක්"
              className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.password ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">මුරපදය නැවත ඇතුළත් කරන්න *</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
              placeholder="මුරපදය නැවත ඇතුළත් කරන්න"
              className={`w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 mt-2">
            {loading ? '⏳ ලියාපදිංචි වෙමින්...' : '✅ ලියාපදිංචි වන්න'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          දැනටමත් ගිණුමක් තිබේද?{' '}
          <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
            පිවිසෙන්න
          </Link>
        </p>
      </div>
    </div>
  );
}