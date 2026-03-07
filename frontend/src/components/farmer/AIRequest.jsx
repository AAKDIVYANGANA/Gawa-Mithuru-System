import { useState, useEffect } from 'react';
import API from '../../utils/api';

export default function AIRequest() {
  const [requests, setRequests] = useState([]);
  const [cattleList, setCattleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

  // Form State
  const [form, setForm] = useState({
    cattle: '', 
    requestDate: '', 
    breedPreference: '', 
    notes: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [reqRes, cattleRes] = await Promise.all([
        API.get('/ai-requests'),
        API.get('/cattle')
      ]);
      setRequests(reqRes.data);
      setCattleList(cattleRes.data);
    } catch (err) {
      console.error("දත්ත ලබාගැනීමේ දෝෂයකි:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ cattle: '', requestDate: '', breedPreference: '', notes: '' });
    setFormError('');
    setShowForm(false);
  };

  const handleSubmit = async () => {
    setFormError('');

    // අනිවාර්ය වැලිඩේෂන් (Mandatory Validations)
    if (!form.cattle) return setFormError('කරුණාකර ගවයා තෝරන්න');
    if (!form.requestDate) return setFormError('කරුණාකර අපේක්ෂිත දිනය ඇතුළත් කරන්න');
    
    // ගව වර්ගය තේරීම අනිවාර්ය කිරීම
    if (!form.breedPreference) return setFormError('කරුණාකර අවශ්‍ය ගව වර්ගය (Breed) තෝරන්න');

    // අතීත දින වැළැක්වීම (Past date validation)
    const today = new Date().toISOString().split('T')[0];
    if (form.requestDate < today) return setFormError('අද හෝ අනාගත දිනයක් තෝරන්න');

    try {
      await API.post('/ai-requests', form);
      setMessage('✅ සිංචන ඉල්ලීම සාර්ථකව යවන ලදී');
      resetForm();
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setFormError('දත්ත සුරැකීමේදී දෝෂයක් ඇති විය. නැවත උත්සාහ කරන්න');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('මෙම ඉල්ලීම ඉවත් කරන්නද?')) return;
    try {
      await API.delete(`/ai-requests/${id}`);
      setMessage('🗑️ ඉල්ලීම ඉවත් කරන ලදී');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('දෝෂයකි');
    }
  };

  const statusInfo = (status) => {
    switch (status) {
      case 'pending': return { label: 'බලාපොරොත්තුවෙන්', color: 'bg-yellow-100 text-yellow-700' };
      case 'approved': return { label: 'අනුමත', color: 'bg-green-100 text-green-700' };
      case 'rejected': return { label: 'ප්‍රතික්ෂේප', color: 'bg-red-100 text-red-700' };
      case 'completed': return { label: 'සම්පූර්ණයි', color: 'bg-blue-100 text-blue-700' };
      default: return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">දත්ත පූරණය වෙමින්...</div>;

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-green-700 flex items-center gap-2">
          <span>💉</span> සිංචන ඉල්ලීම
        </h2>
        <button onClick={() => { setShowForm(!showForm); setFormError(''); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
            showForm ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-600 text-white hover:bg-green-700'
          }`}>
          {showForm ? '✕ අවලංගු කරන්න' : '+ නව ඉල්ලීමක්'}
        </button>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm shadow-sm animate-bounce">
          {message}
        </div>
      )}

      {/* Input Form Section */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-green-500 rounded-full"></span>
            නව සිංචන විස්තර ඇතුළත් කරන්න
          </h3>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span>⚠️</span> {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cattle Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ගවයා තෝරන්න *</label>
              <select 
                value={form.cattle} 
                onChange={(e) => setForm({ ...form, cattle: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="">ගවයා තෝරන්න</option>
                {cattleList.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.cattleId})</option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">අපේක්ෂිත දිනය *</label>
              <input 
                type="date" 
                value={form.requestDate}
                min={new Date().toISOString().split('T')[0]} // UI එකෙන් අතීත දින වැළැක්වීම
                onChange={(e) => setForm({ ...form, requestDate: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all" 
              />
            </div>

            {/* Breed Selection - Mandatory */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ගව වර්ගය *</label>
              <select 
                value={form.breedPreference} 
                onChange={(e) => setForm({ ...form, breedPreference: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="">තෝරන්න</option>
                <option value="දේශීය">දේශීය</option>
                <option value="ජර්සි">ජර්සි</option>
                <option value="ෆ්‍රීසියන්">ෆ්‍රීසියන්</option>
                <option value="සහිවාල්">සහිවාල්</option>
                <option value="එයාර්ෂයර්">එයාර්ෂයර්</option>
                <option value="මිශ්‍ර">මිශ්‍ර</option>
              </select>
            </div>

            {/* Notes Section */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">අමතර සටහන්</label>
              <input 
                type="text" 
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="උදා: සත්වයාගේ වර්තමාන තත්ත්වය..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all" 
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button 
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              💾 ඉල්ලීම සුරකින්න
            </button>
            <button 
              onClick={resetForm}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-3 rounded-xl font-bold transition-all"
            >
              අවලංගු කරන්න
            </button>
          </div>
        </div>
      )}

      {/* History List Section */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="text-6xl mb-4 opacity-20">💉</div>
            <p className="text-gray-500 font-medium">තවමත් කිසිදු සිංචන ඉල්ලීමක් සිදුකර නොමැත.</p>
          </div>
        ) : (
          requests.map(r => {
            const s = statusInfo(r.status);
            return (
              <div key={r._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🐄</span>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg leading-none">{r.cattle?.name}</h4>
                        <span className="text-gray-400 text-[10px] font-mono">ID: {r.cattle?.cattleId}</span>
                      </div>
                      <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${s.color}`}>
                        {s.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-[10px] text-gray-400 block uppercase">අපේක්ෂිත දිනය</span>
                        <p className="text-sm font-semibold text-gray-700">{r.requestDate?.split('T')[0]}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-[10px] text-gray-400 block uppercase">වර්ගය</span>
                        <p className="text-sm font-semibold text-gray-700">{r.breedPreference || 'සඳහන් කර නැත'}</p>
                      </div>
                    </div>
                  </div>

                  {r.status === 'pending' && (
                    <button onClick={() => handleDelete(r._id)}
                      className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 px-4 py-2 rounded-xl text-xs font-bold transition-all">
                      ඉවත් කරන්න
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}