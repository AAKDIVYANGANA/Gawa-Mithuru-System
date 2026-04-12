import { useState, useEffect } from 'react';
import API from '../../utils/api';

export default function HealthReport() {
  const [reports, setReports] = useState([]);
  const [cattleList, setCattleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    cattle: '', date: '', temperature: '', symptoms: '', notes: '', isAlert: false
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [healthRes, cattleRes] = await Promise.all([
        API.get('/health'),
        API.get('/cattle')
      ]);
      setReports(healthRes.data);
      setCattleList(cattleRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ cattle: '', date: '', temperature: '', symptoms: '', notes: '', isAlert: false });
    setEditId(null);
    setFormError('');
    setShowForm(false);
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!form.cattle) return setFormError('ගවයා තෝරන්න');
    if (!form.date) return setFormError('දිනය ඇතුළත් කරන්න');
    if (!form.temperature) return setFormError('උෂ්ණත්වය ඇතුළත් කරන්න');
    if (!form.symptoms.trim()) return setFormError('රෝග ලක්ෂණ ඇතුළත් කරන්න');

    const today = new Date().toISOString().split('T')[0];
    if (form.date > today) return setFormError('අනාගත දිනයක් තෝරා ගත නොහැක');

    const temp = parseFloat(form.temperature);
    if (temp < 35 || temp > 43) return setFormError('උෂ්ණත්වය 35°C - 43°C අතර විය යුතුය');

    try {
      if (editId) {
        await API.put(`/health/${editId}`, form);
        setMessage('✅ වාර්තාව යාවත්කාලීන කරන ලදී');
      } else {
        await API.post('/health', form);
        setMessage('✅ සෞඛ්‍ය වාර්තාව සුරකින ලදී');
      }
      resetForm();
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setFormError('දෝෂයකි. නැවත උත්සාහ කරන්න');
    }
  };

  const handleEdit = (r) => {
    setForm({
      cattle: r.cattle?._id || '',
      date: r.date?.split('T')[0] || '',
      temperature: r.temperature || '',
      symptoms: r.symptoms || '',
      notes: r.notes || '',
      isAlert: r.isAlert || false
    });
    setEditId(r._id);
    setShowForm(true);
    setFormError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('මෙම වාර්තාව ඉවත් කරන්නද?')) return;
    try {
      await API.delete(`/health/${id}`);
      setMessage('🗑️ වාර්තාව ඉවත් කරන ලදී');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('දෝෂයකි');
    }
  };

  const alertReports = reports.filter(r => r.isAlert);

  if (loading) return <div className="text-center py-10 text-gray-400">දත්ත පූරණය වෙමින්...</div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-green-700">🌡️ සෞඛ්‍ය වාර්තා</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setFormError('');
          setForm({ cattle: '', date: '', temperature: '', symptoms: '', notes: '', isAlert: false }); }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          {showForm ? '✕ අවලංගු කරන්න' : '+ නව වාර්තාවක්'}
        </button>
      </div>

      {/* Alert Banner */}
      {alertReports.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-6">
          <p className="text-red-700 font-semibold text-sm">
            ⚠️ අවවාද {alertReports.length}ක් — {alertReports.map(r => r.cattle?.name).join(', ')} ගවයන්ට ප්‍රතිකාර අවශ්‍යයි!
          </p>
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
          {message}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            {editId ? '✏️ වාර්තාව සංස්කරණය' : '➕ නව සෞඛ්‍ය වාර්තාව'}
          </h3>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
              ⚠️ {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ගවයා *</label>
              <select value={form.cattle} onChange={(e) => setForm({ ...form, cattle: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="">ගවයා තෝරන්න</option>
                {cattleList.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.cattleId})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">දිනය *</label>
              <input type="date" value={form.date} max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">උෂ්ණත්වය (°C) *</label>
              <input type="number" step="0.1" min="35" max="43" value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                placeholder="උදා: 38.5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
              <p className="text-xs text-gray-400 mt-1">සාමාන්‍ය: 38°C - 39.5°C</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">රෝග ලක්ෂණ *</label>
              <input type="text" value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                placeholder="උදා: උණ, කෑම නොකෑම"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">අතිරේක සටහන්</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="වෙනත් විස්තර..."
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isAlert}
                  onChange={(e) => setForm({ ...form, isAlert: e.target.checked })}
                  className="w-4 h-4 accent-red-500" />
                <span className="text-sm font-medium text-red-600">⚠️ හදිසි අවවාදයක් ලෙස සලකුණු කරන්න</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition">
              {editId ? '✅ යාවත්කාලීන කරන්න' : '💾 සුරකින්න'}
            </button>
            <button onClick={resetForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition">
              අවලංගු
            </button>
          </div>
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🌡️</div>
          <p>සෞඛ්‍ය වාර්තා නොමැත</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(r => (
            <div key={r._id}
              className={`bg-white rounded-xl shadow p-4 border-l-4 ${r.isAlert ? 'border-red-500' : 'border-green-400'}`}>
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-gray-800">{r.cattle?.name}</span>
                    <span className="text-gray-400 text-xs">({r.cattle?.cattleId})</span>
                    <span className="text-xs text-gray-500">{r.date?.split('T')[0]}</span>
                    {r.isAlert && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        ⚠️ හදිසි
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">උෂ්ණත්වය</span>
                      <p className={`font-semibold ${parseFloat(r.temperature) > 39.5 ? 'text-red-600' : 'text-green-600'}`}>
                        {r.temperature}°C
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 text-xs">රෝග ලක්ෂණ</span>
                      <p className="text-gray-700">{r.symptoms}</p>
                    </div>
                    {r.notes && (
                      <div>
                        <span className="text-gray-500 text-xs">සටහන්</span>
                        <p className="text-gray-600 text-xs">{r.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(r)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-medium transition">
                    සංස්කරණය
                  </button>
                  <button onClick={() => handleDelete(r._id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-medium transition">
                    ඉවත් කරන්න
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}