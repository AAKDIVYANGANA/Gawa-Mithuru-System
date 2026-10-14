import { useState, useEffect } from 'react';
import API from '../../utils/api';

export default function CattleSection() {
  const [cattle, setCattle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [selectedCattle, setSelectedCattle] = useState(null);
  const [sireLoading, setSireLoading] = useState(false);
  const [damMode, setDamMode] = useState('system');

  const [form, setForm] = useState({
    name: '', cattleId: '', breed: '', gender: 'ගැහැණු', dob: '',
    status: 'සෞඛ්‍යසම්පන්න',
    dam: '', damText: '',
    sire: '', sireText: '',
    weight: '',
    pregnancyDate: '', expectedCalvingDate: '',
    calvingDate: '', calvingNotes: '',
    deathDate: '', deathReason: '', deathNotes: ''
  });

  const breeds = ['Jersey', 'Friesian', 'Ayrshire', 'Sahiwal', 'Lanka White', 'Mixed'];
  const statuses = ['සෞඛ්‍යසම්පන්න', 'අසනීප', 'ගර්භනී', 'වියළී', 'මළ', 'විකිණී'];
  const activeCattle = cattle.filter(c => c.status !== 'මළ' && c.status !== 'විකිණී');
  const inactiveCattle = cattle.filter(c => c.status === 'මළ' || c.status === 'විකිණී');

  useEffect(() => { fetchCattle(); }, []);

  const fetchCattle = async () => {
    try {
      const res = await API.get('/cattle');
      setCattle(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({
      name: '', cattleId: '', breed: '', gender: 'ගැහැණු', dob: '',
      status: 'සෞඛ්‍යසම්පන්න',
      dam: '', damText: '', sire: '', sireText: '',
      weight: '',
      pregnancyDate: '', expectedCalvingDate: '',
      calvingDate: '', calvingNotes: '',
      deathDate: '', deathReason: '', deathNotes: ''
    });
    setDamMode('system');
    setEditId(null);
    setFormError('');
    setShowForm(false);
  };

  const handleEdit = (c) => {
    const isExternal = !c.dam && c.damText && c.damText.trim();
    setDamMode(isExternal ? 'external' : 'system');
    setForm({
      name: c.name || '', cattleId: c.cattleId || '',
      breed: c.breed || '', gender: c.gender || 'ගැහැණු',
      dob: c.dob?.split('T')[0] || '',
      status: c.status || 'සෞඛ්‍යසම්පන්න',
      dam: c.dam?._id || '',
      damText: c.damText || '',
      sire: c.sire || '',
      sireText: c.sireText || '',
      weight: c.weight || '',
      pregnancyDate: c.pregnancyDate?.split('T')[0] || '',
      expectedCalvingDate: c.expectedCalvingDate?.split('T')[0] || '',
      calvingDate: c.calvingDate?.split('T')[0] || '',
      calvingNotes: c.calvingNotes || '',
      deathDate: c.deathDate?.split('T')[0] || '',
      deathReason: c.deathReason || '',
      deathNotes: c.deathNotes || ''
    });
    setEditId(c._id);
    setShowForm(true);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const autoFetchSire = async (damId, dob) => {
    if (!damId || !dob) return;
    setSireLoading(true);
    try {
      const res = await API.get(`/cattle/${damId}/ai-for-calf?dob=${dob}`);
      if (res.data?.bullId) {
        const sireLabel = `${res.data.bullId}${res.data.semenBreed ? ' (' + res.data.semenBreed + ')' : ''}`;
        setForm(prev => ({ ...prev, sire: sireLabel, sireText: '' }));
      } else {
        setForm(prev => ({ ...prev, sire: '', sireText: 'Unknown / Not recorded' }));
      }
    } catch (err) {
      setForm(prev => ({ ...prev, sire: '', sireText: 'Unknown / Not recorded' }));
    } finally { setSireLoading(false); }
  };

  const handleDamChange = async (damId) => {
    setForm(prev => ({ ...prev, dam: damId, sire: '', sireText: '' }));
    if (damId && form.dob) await autoFetchSire(damId, form.dob);
  };

  const handleDobChange = async (dob) => {
    setForm(prev => ({ ...prev, dob, sire: '', sireText: '' }));
    if (form.dam && dob) await autoFetchSire(form.dam, dob);
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!form.name.trim()) return setFormError('නම ඇතුළත් කරන්න');
    if (!form.cattleId.trim()) return setFormError('Tag No ඇතුළත් කරන්න');
    if (!form.breed) return setFormError('ප්‍රභේදය තෝරන්න');
    try {
      const payload = {
        name: form.name,
        cattleId: form.cattleId,
        breed: form.breed,
        gender: form.gender,
        dob: form.dob || undefined,
        status: form.status,
        weight: form.weight || undefined,
        pregnancyDate: form.pregnancyDate || undefined,
        expectedCalvingDate: form.expectedCalvingDate || undefined,
        calvingDate: form.calvingDate || undefined,
        calvingNotes: form.calvingNotes || undefined,
        deathDate: form.deathDate || undefined,
        deathReason: form.deathReason || undefined,
        deathNotes: form.deathNotes || undefined,
      };

      if (damMode === 'system') {
        payload.dam = form.dam || null;
        payload.damText = '';
        payload.sire = form.sire || '';
        payload.sireText = '';
      } else {
        payload.dam = null;
        payload.damText = form.damText || 'Unknown / Not recorded';
        payload.sire = '';
        payload.sireText = form.sireText || 'Unknown / Not recorded';
      }

      if (editId) {
        await API.put(`/cattle/${editId}`, payload);
        setMessage('✅ ගව තොරතුරු යාවත්කාලීන කරන ලදී');
      } else {
        await API.post('/cattle', payload);
        setMessage('✅ ගවයා ලියාපදිංචි කරන ලදී');
      }
      resetForm();
      fetchCattle();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'දෝෂයකි');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ගවයා ඉවත් කිරීමට ඔබ සහතිකද?')) return;
    try {
      await API.delete(`/cattle/${id}`);
      fetchCattle();
      setMessage('✅ ගවයා ඉවත් කරන ලදී');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { console.error(err); }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'සෞඛ්‍යසම්පන්න': return 'bg-green-100 text-green-700';
      case 'අසනීප': return 'bg-red-100 text-red-700';
      case 'ගර්භනී': return 'bg-yellow-100 text-yellow-700';
      case 'වියළී': return 'bg-blue-100 text-blue-700';
      case 'මළ': return 'bg-gray-100 text-gray-700';
      case 'විකිණී': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const calcAge = (dob) => {
    if (!dob) return '-';
    const diff = Date.now() - new Date(dob).getTime();
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    if (years > 0) return `${years} අවු ${months % 12} මාස`;
    return `${months} මාස`;
  };

  const getSireDisplay = (c) => {
    if (c.sire && c.sire.trim()) return { text: c.sire, type: 'ai' };
    if (c.sireText && c.sireText.trim()) return { text: c.sireText, type: 'manual' };
    return null;
  };

  const getDamDisplay = (c) => {
    if (c.dam) return { text: `${c.dam.name} (${c.dam.cattleId})`, type: 'system' };
    if (c.damText && c.damText.trim()) return { text: c.damText, type: 'manual' };
    return null;
  };

  if (loading) return <div className="text-center py-10 text-gray-400">දත්ත පූරණය වෙමින්...</div>;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-green-700">🐄 ගව කළමනාකරණය</h2>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          {showForm ? '✕ අවලංගු' : '+ ගවයෙකු එකතු කරන්න'}
        </button>
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{message}</div>}

      {/* FORM */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-5 mb-6 border border-green-200">
          <h3 className="font-bold text-green-700 mb-4">
            {editId ? '✏️ ගව තොරතුරු යාවත්කාලීන කිරීම' : '➕ නව ගවයෙකු ලියාපදිංචි කිරීම'}
          </h3>
          {formError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">⚠️ {formError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">නම *</label>
              <input type="text" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="ගවයාගේ නම"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag No *</label>
              <input type="text" value={form.cattleId}
                onChange={e => setForm({ ...form, cattleId: e.target.value })}
                placeholder="C001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ප්‍රභේදය *</label>
              <select value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="">ප්‍රභේදය තෝරන්න</option>
                {breeds.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ලිංගය</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="ගැහැණු">ගැහැණු 🐄</option>
                <option value="පිරිමි">පිරිමි 🐂</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">උපන් දිනය</label>
              <input type="date" value={form.dob}
                onChange={e => handleDobChange(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">බර (kg)</label>
              <input type="number" value={form.weight}
                onChange={e => setForm({ ...form, weight: e.target.value })}
                placeholder="kg"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">තත්ත්වය</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* PEDIGREE SECTION */}
          <div className="mt-5 p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="font-semibold text-green-700 mb-4">🌳 Pedigree තොරතුරු</p>

            {/* Dam mode toggle */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">මව (Dam)</label>
              <div className="flex gap-2 mb-2">
                <button type="button"
                  onClick={() => {
                    setDamMode('system');
                    setForm(prev => ({ ...prev, damText: '', sire: '', sireText: '' }));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    damMode === 'system'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}>
                  🐄 System ගවයෙකු
                </button>
                <button type="button"
                  onClick={() => {
                    setDamMode('external');
                    setForm(prev => ({ ...prev, dam: '', sire: '', sireText: '' }));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    damMode === 'external'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}>
                  🏪 පිටතින් ගෙනාවා / නොදනී
                </button>
              </div>

              {damMode === 'system' ? (
                <select value={form.dam} onChange={e => handleDamChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                  <option value="">මව නොමැත / නොදනී</option>
                  {cattle.filter(c => c._id !== editId && c.gender !== 'පිරිමි').map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.cattleId})</option>
                  ))}
                </select>
              ) : (
                <input type="text" value={form.damText}
                  onChange={e => setForm({ ...form, damText: e.target.value })}
                  placeholder="e.g. Jersey Cow from Silva Farm / Unknown / Not recorded"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              )}
            </div>

            {/* Sire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                පිය ගොනා (Sire / Bull)
              </label>

              {damMode === 'system' ? (
                sireLoading ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-blue-500">⏳ AI record සොයමින්...</p>
                  </div>
                ) : form.sire ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                    <p className="text-sm font-semibold text-blue-700">{form.sire}</p>
                    <p className="text-xs text-blue-500 mt-0.5">
                      ✅ උපන් දිනයට ගැළපෙන AI record — ස්වයංක්‍රීයව
                    </p>
                  </div>
                ) : form.sireText ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-yellow-700 font-medium">⚠️ {form.sireText}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-gray-400">
                      {form.dam
                        ? form.dob
                          ? '🔍 AI record match නොවීය — Unknown / Not recorded'
                          : '📅 උපන් දිනය enter කළ පසු AI record auto-check කෙරේ'
                        : 'මව select කළ + DOB enter කළ පසු ස්වයංක්‍රීයව පෙනේ'}
                    </p>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2 mb-1">
                    <button type="button"
                      onClick={() => setForm(prev => ({ ...prev, sireText: 'Unknown / Not recorded' }))}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                      Unknown / Not recorded
                    </button>
                  </div>
                  <input type="text" value={form.sireText}
                    onChange={e => setForm({ ...form, sireText: e.target.value })}
                    placeholder="e.g. Bull B001 (Jersey) / Unknown / Not recorded"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              )}
            </div>
          </div>

          {/* Pregnancy Fields */}
          {form.status === 'ගර්භනී' && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="font-semibold text-yellow-700 mb-3">🤰 ගර්භනී තොරතුරු</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ගර්භනී දිනය</label>
                  <input type="date" value={form.pregnancyDate}
                    onChange={e => {
                      const pd = e.target.value;
                      const expected = new Date(pd);
                      expected.setDate(expected.getDate() + 280);
                      setForm({ ...form, pregnancyDate: pd, expectedCalvingDate: expected.toISOString().split('T')[0] });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">අපේක්ෂිත ප්‍රසූති දිනය</label>
                  <input type="date" value={form.expectedCalvingDate}
                    onChange={e => setForm({ ...form, expectedCalvingDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                  <p className="text-xs text-yellow-600 mt-1">⚙️ ගර්භනී දිනය + 280 දින ස්වයංක්‍රීයව</p>
                </div>
              </div>
            </div>
          )}

          {/* Death Fields */}
          {form.status === 'මළ' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-300">
              <p className="font-semibold text-gray-700 mb-3">💀 මරණ තොරතුරු</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">මරණ දිනය</label>
                  <input type="date" value={form.deathDate}
                    onChange={e => setForm({ ...form, deathDate: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">මරණ හේතුව</label>
                  <input type="text" value={form.deathReason}
                    onChange={e => setForm({ ...form, deathReason: e.target.value })}
                    placeholder="රෝගය / අනතුර / වෙනත්"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">සටහන්</label>
                  <input type="text" value={form.deathNotes}
                    onChange={e => setForm({ ...form, deathNotes: e.target.value })}
                    placeholder="අතිරේක විස්තර"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <button onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition">
              💾 {editId ? 'යාවත්කාලීන කරන්න' : 'ලියාපදිංචි කරන්න'}
            </button>
            <button onClick={resetForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition">
              අවලංගු
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{activeCattle.length}</p>
          <p className="text-xs text-green-600">සක්‍රීය ගව</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-700">{cattle.filter(c => c.status === 'ගර්භනී').length}</p>
          <p className="text-xs text-yellow-600">ගර්භනී</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{cattle.filter(c => c.status === 'අසනීප').length}</p>
          <p className="text-xs text-red-600">අසනීප</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-gray-700">{inactiveCattle.length}</p>
          <p className="text-xs text-gray-600">මළ / විකිණී</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { id: 'list', label: '📋 ගව ලැයිස්තුව' },
          { id: 'pregnant', label: '🤰 ගර්භනී ගව' },
          { id: 'pedigree', label: '🌳 Pedigree' },
          { id: 'inactive', label: '📁 ඉතිහාසය' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>{tab.label}</button>
        ))}
      </div>

      {/* LIST TAB */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {activeCattle.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🐄</div>
              <p>ගව ලියාපදිංචි නොවී ඇත</p>
            </div>
          ) : activeCattle.map(c => (
            <div key={c._id} className={`bg-white rounded-xl shadow p-4 border-l-4 ${
              c.status === 'ගර්භනී' ? 'border-yellow-400' :
              c.status === 'අසනීප' ? 'border-red-500' : 'border-green-400'
            }`}>
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-gray-800 text-lg">{c.name}</span>
                    <span className="text-gray-400 text-xs">#{c.cattleId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(c.status)}`}>{c.status}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{c.gender}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><span className="text-gray-500 text-xs">ප්‍රභේදය</span><p>{c.breed}</p></div>
                    <div><span className="text-gray-500 text-xs">වයස</span><p>{calcAge(c.dob)}</p></div>
                    <div><span className="text-gray-500 text-xs">බර</span><p>{c.weight ? `${c.weight} kg` : '-'}</p></div>
                    <div>
                      <span className="text-gray-500 text-xs">Sire</span>
                      {getSireDisplay(c) ? (
                        <p className={`text-xs font-medium ${
                          getSireDisplay(c).type === 'ai' ? 'text-blue-700' : 'text-orange-600'
                        }`}>{getSireDisplay(c).text}</p>
                      ) : <p className="text-gray-300 text-xs">-</p>}
                    </div>
                  </div>
                  {getDamDisplay(c) && (
                    <p className="text-xs text-gray-500 mt-1">
                      🐄 මව: {getDamDisplay(c).text}
                      {getDamDisplay(c).type === 'manual' && (
                        <span className="ml-1 text-orange-500">(external)</span>
                      )}
                    </p>
                  )}
                  {c.offspring?.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">🐮 දරුවන්: {c.offspring.map(o => o.name).join(', ')}</p>
                  )}
                  {c.status === 'ගර්භනී' && c.expectedCalvingDate && (
                    <div className="mt-2 bg-yellow-50 rounded-lg px-3 py-1.5 text-xs text-yellow-700">
                      🤰 අපේක්ෂිත ප්‍රසූති දිනය: <strong>{c.expectedCalvingDate?.split('T')[0]}</strong>
                      {(() => {
                        const days = Math.ceil((new Date(c.expectedCalvingDate) - new Date()) / (1000 * 60 * 60 * 24));
                        return days > 0 ? ` (දින ${days}ක් ඉතිරිව ඇත)` : ' (ප්‍රසූති කාලය පසු විය)';
                      })()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedCattle(c); setActiveTab('pedigree'); }}
                    className="bg-green-50 hover:bg-green-100 text-green-600 px-2 py-1 rounded-lg text-xs font-medium transition">🌳</button>
                  <button onClick={() => handleEdit(c)}
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-3 py-1 rounded-lg text-xs font-medium transition">✏️ Edit</button>
                  <button onClick={() => handleDelete(c._id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-medium transition">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PREGNANT TAB */}
      {activeTab === 'pregnant' && (
        <div className="space-y-4">
          {cattle.filter(c => c.status === 'ගර්භනී').length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🤰</div><p>ගර්භනී ගව නොමැත</p>
            </div>
          ) : cattle.filter(c => c.status === 'ගර්භනී').map(c => {
            const daysLeft = c.expectedCalvingDate
              ? Math.ceil((new Date(c.expectedCalvingDate) - new Date()) / (1000 * 60 * 60 * 24))
              : null;
            return (
              <div key={c._id} className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-400">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-800 text-lg">{c.name}</span>
                      <span className="text-gray-400 text-xs">#{c.cattleId}</span>
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">🤰 ගර්භනී</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div><span className="text-gray-500 text-xs">ගර්භනී දිනය</span><p>{c.pregnancyDate?.split('T')[0] || '-'}</p></div>
                      <div><span className="text-gray-500 text-xs">අපේක්ෂිත ප්‍රසූතිය</span><p className="font-semibold">{c.expectedCalvingDate?.split('T')[0] || '-'}</p></div>
                      <div>
                        <span className="text-gray-500 text-xs">ඉතිරි දින</span>
                        <p className={`font-bold ${daysLeft !== null && daysLeft <= 14 ? 'text-red-600' : 'text-green-600'}`}>
                          {daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} දින` : 'ප්‍රසූති කාලය ළඟ!') : '-'}
                        </p>
                      </div>
                    </div>
                    {daysLeft !== null && daysLeft <= 14 && (
                      <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-xs text-red-700">
                        ⚠️ ප්‍රසූතිය ළඟ! LDO සහ Vet දැනුවත් කරන්න.
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleEdit(c)}
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-3 py-1 rounded-lg text-xs font-medium transition">✏️ Edit</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PEDIGREE TAB */}
      {activeTab === 'pedigree' && (
        <div>
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">ගවයා තෝරන්න</label>
            <select
              onChange={e => setSelectedCattle(cattle.find(c => c._id === e.target.value) || null)}
              value={selectedCattle?._id || ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="">ගවයෙකු තෝරන්න</option>
              {cattle.map(c => <option key={c._id} value={c._id}>{c.name} ({c.cattleId})</option>)}
            </select>
          </div>

          {selectedCattle && (
            <div className="space-y-4">
              {/* Subject */}
              <div className="bg-green-600 text-white rounded-xl p-4 text-center shadow">
                <p className="text-2xl mb-1">🐄</p>
                <p className="font-bold text-lg">{selectedCattle.name}</p>
                <p className="text-green-200 text-sm">#{selectedCattle.cattleId} • {selectedCattle.breed} • {selectedCattle.gender}</p>
                <p className="text-green-200 text-xs mt-1">{calcAge(selectedCattle.dob)} • {selectedCattle.status}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sire */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-700 mb-3">🐂 පිය ගොනා (Sire)</h4>
                  {getSireDisplay(selectedCattle) ? (
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-semibold text-gray-800">{getSireDisplay(selectedCattle).text}</p>
                      <p className="text-xs mt-1">
                        {getSireDisplay(selectedCattle).type === 'ai'
                          ? <span className="text-blue-600">✅ AI Bull — LDO recorded</span>
                          : <span className="text-orange-500">📝 Manual entry</span>
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Sire දත්ත නොමැත</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Dam + DOB enter කළ විට AI record match වුනොත් auto-populate වේ
                      </p>
                    </div>
                  )}
                </div>

                {/* Dam */}
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                  <h4 className="font-semibold text-pink-700 mb-3">🐄 මව (Dam)</h4>
                  {selectedCattle.dam ? (
                    <div className="bg-white rounded-lg p-3 cursor-pointer hover:bg-pink-50"
                      onClick={() => {
                        const mother = cattle.find(c => c._id === selectedCattle.dam._id);
                        if (mother) setSelectedCattle(mother);
                      }}>
                      <p className="font-semibold text-gray-800">{selectedCattle.dam.name}</p>
                      <p className="text-xs text-gray-500">#{selectedCattle.dam.cattleId} — click to view</p>
                    </div>
                  ) : getDamDisplay(selectedCattle) ? (
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-semibold text-gray-700">{getDamDisplay(selectedCattle).text}</p>
                      <p className="text-xs text-orange-500 mt-1">📝 External / Manual entry</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Dam දත්ත නොමැත</p>
                  )}
                </div>
              </div>

              {/* Offspring */}
              {selectedCattle.offspring?.length > 0 && (
                <div className="bg-white rounded-xl shadow p-4">
                  <h4 className="font-semibold text-green-700 mb-3">🐮 දරුවන් ({selectedCattle.offspring.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedCattle.offspring.map(o => (
                      <div key={o._id}
                        className="bg-green-50 border border-green-200 rounded-lg p-3 cursor-pointer hover:bg-green-100"
                        onClick={() => {
                          const child = cattle.find(c => c._id === o._id);
                          if (child) setSelectedCattle(child);
                        }}>
                        <p className="font-semibold text-sm text-gray-800">{o.name}</p>
                        <p className="text-xs text-gray-500">#{o.cattleId}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(o.status)}`}>{o.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifecycle Events */}
              {selectedCattle.lifecycleEvents?.length > 0 && (
                <div className="bg-white rounded-xl shadow p-4">
                  <h4 className="font-semibold text-green-700 mb-3">📅 ජීවන චක්‍ර සිදුවීම්</h4>
                  <div className="space-y-2">
                    {[...selectedCattle.lifecycleEvents].reverse().map((ev, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                        <span className="text-lg">
                          {ev.event === 'born' ? '🐮' :
                           ev.event === 'pregnant' ? '🤰' :
                           ev.event === 'calved' ? '🎉' :
                           ev.event === 'ai' ? '💉' :
                           ev.event === 'died' ? '💀' :
                           ev.event === 'sick' ? '🌡️' : '📌'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-800 capitalize">{ev.event}</p>
                          <p className="text-xs text-gray-500">{ev.date?.split('T')[0]} — {ev.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Death Info */}
              {selectedCattle.status === 'මළ' && (
                <div className="bg-gray-100 border border-gray-300 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">💀 මරණ තොරතුරු</h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div><span className="text-gray-500 text-xs">මරණ දිනය</span><p>{selectedCattle.deathDate?.split('T')[0] || '-'}</p></div>
                    <div><span className="text-gray-500 text-xs">හේතුව</span><p>{selectedCattle.deathReason || '-'}</p></div>
                    <div><span className="text-gray-500 text-xs">සටහන්</span><p>{selectedCattle.deathNotes || '-'}</p></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* INACTIVE TAB */}
      {activeTab === 'inactive' && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-4">📁 මළ ගව ({inactiveCattle.length})</h3>
          {inactiveCattle.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📁</div><p>ඉතිහාස ගව නොමැත</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inactiveCattle.map(c => (
                <div key={c._id} className="bg-white rounded-xl shadow p-4 border-l-4 border-gray-400 opacity-80">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-700">{c.name}</span>
                        <span className="text-gray-400 text-xs">#{c.cattleId}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(c.status)}`}>{c.status}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div><span className="text-gray-500 text-xs">ප්‍රභේදය</span><p>{c.breed}</p></div>
                        <div><span className="text-gray-500 text-xs">වයස</span><p>{calcAge(c.dob)}</p></div>
                        {c.status === 'මළ' && (
                          <div><span className="text-gray-500 text-xs">මරණ දිනය</span><p>{c.deathDate?.split('T')[0] || '-'}</p></div>
                        )}
                      </div>
                      {c.status === 'මළ' && c.deathReason && (
                        <p className="text-xs text-gray-500 mt-1">හේතුව: {c.deathReason}</p>
                      )}
                      {getDamDisplay(c) && (
                        <p className="text-xs text-gray-500 mt-1">
                          🐄 මව: {getDamDisplay(c).text}
                          {getDamDisplay(c).type === 'manual' && (
                            <span className="ml-1 text-orange-500">(external)</span>
                          )}
                        </p>
                      )}
                      {getSireDisplay(c) && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          🐂 Sire: {getSireDisplay(c).text}
                        </p>
                      )}
                      {c.offspring?.length > 0 && (
                        <p className="text-xs text-green-600 mt-1">🐮 දරුවන්: {c.offspring.map(o => o.name).join(', ')}</p>
                      )}
                    </div>
                    <button onClick={() => { setSelectedCattle(c); setActiveTab('pedigree'); }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium transition">
                      🌳 Pedigree
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}