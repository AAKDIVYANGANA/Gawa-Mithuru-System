import { useState, useEffect } from 'react';
import API from '../../utils/api';

export default function AIRequest() {
  const [requests, setRequests] = useState([]);
  const [cattleList, setCattleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showWeightCalc, setShowWeightCalc] = useState(null);
  const [showHeatForm, setShowHeatForm] = useState(null);
  const [heatDate, setHeatDate] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [girth, setGirth] = useState('');
  const [length, setLength] = useState('');
  const [calcWeight, setCalcWeight] = useState(null);
  const [notifying, setNotifying] = useState(null);

  const [form, setForm] = useState({
    cattle: '', requestDate: '', breedPreference: '', notes: ''
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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getAgeMonths = (dob) => {
    if (!dob) return 0;
    const birth = new Date(dob);
    const now = new Date();
    return (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());
  };

  const calculateWeight = () => {
    if (!girth || !length) return;
    const weightLbs = (girth * girth * length) / 300;
    const weightKg = parseFloat((weightLbs * 0.453592).toFixed(1));
    setCalcWeight(weightKg);
  };

  const saveWeight = async (cattleId) => {
    try {
      await API.put(`/cattle/${cattleId}/weight`, { girth, length });
      setMessage('✅ බර සුරකින ලදී');
      setShowWeightCalc(null);
      setGirth(''); setLength(''); setCalcWeight(null);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { console.error(err); }
  };

  const saveHeatDate = async (cattleId) => {
    if (!heatDate) return;
    try {
      await API.put(`/cattle/${cattleId}/heat`, { lastHeatDate: heatDate });
      setMessage('✅ රත් වූ දිනය සුරකින ලදී');
      setShowHeatForm(null);
      setHeatDate('');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('❌ Notification යැවීම අසාර්ථකයි');
    }
  };

  const sendAIReadyNotification = async (cattle) => {
    setNotifying(cattle._id);
    try {
      await API.post('/notifications/ai-ready', {
        cattleId: cattle._id,
        message: `${cattle.name} (${cattle.cattleId}) - AI සිංචනයට සූදානම්! ගොවියා දැනුම් දෙනවා.`
      });
      setMessage(`✅ "${cattle.name}" සඳහා LDO ට notification යවන ලදී!`);
      setTimeout(() => setMessage(''), 4000);
    } catch {
      setMessage('❌ Notification යැවීම අසාර්ථකයි');
    } finally {
      setNotifying(null);
    }
  };

  const resetForm = () => {
    setForm({ cattle: '', requestDate: '', breedPreference: '', notes: '' });
    setFormError('');
    setShowForm(false);
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!form.cattle) return setFormError('ගවයා තෝරන්න');
    if (!form.requestDate) return setFormError('දිනය ඇතුළත් කරන්න');
    const today = new Date().toISOString().split('T')[0];
    if (form.requestDate < today) return setFormError('අද හෝ අනාගත දිනයක් තෝරන්න');
    try {
      const payload = {
        cattle: form.cattle,
        requestDate: form.requestDate,
        notes: form.notes,
        ...(form.breedPreference && { breedPreference: form.breedPreference })
      };
      await API.post('/ai-requests', payload);
      setMessage('✅ සිංචන ඉල්ලීම යවන ලදී');
      resetForm();
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch { setFormError('දෝෂයකි. නැවත උත්සාහ කරන්න'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('මෙම ඉල්ලීම ඉවත් කරන්නද?')) return;
    try {
      await API.delete(`/ai-requests/${id}`);
      setMessage('🗑️ ඉල්ලීම ඉවත් කරන ලදී');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('දෝෂයකි'); }
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

  const today = new Date();
  const aiReadyCattle = cattleList.filter(c => getAgeMonths(c.dob) >= 14);

  const heatAlerts = cattleList.filter(c => {
    if (!c.lastHeatDate) return false;
    const nextHeat = new Date(c.lastHeatDate);
    nextHeat.setDate(nextHeat.getDate() + 21);
    const daysUntil = Math.ceil((nextHeat - today) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 2;
  });

  const WeightCalcPanel = ({ cattleId, theme = 'blue' }) => (
    <div className={`w-full mt-2 bg-${theme}-50 rounded-lg p-3`}>
      <p className={`text-sm font-semibold text-${theme}-700 mb-2`}>⚖️ බර ගණනය (Girth-Length Formula)</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-600">Girth - පපුව වටය (අඟල්)</label>
          <input type="number" value={girth}
            onChange={e => { setGirth(e.target.value); setCalcWeight(null); }}
            placeholder="e.g. 62"
            className={`w-full border rounded-lg px-2 py-1.5 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-${theme}-400`} />
        </div>
        <div>
          <label className="text-xs text-gray-600">Length - ශරීර දිග (අඟල්)</label>
          <input type="number" value={length}
            onChange={e => { setLength(e.target.value); setCalcWeight(null); }}
            placeholder="e.g. 52"
            className={`w-full border rounded-lg px-2 py-1.5 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-${theme}-400`} />
        </div>
      </div>
      <div className="flex gap-2 items-center flex-wrap">
        <button onClick={calculateWeight}
          className={`bg-${theme}-600 hover:bg-${theme}-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition`}>
          🧮 ගණනය කරන්න
        </button>
        {calcWeight && (
          <>
            <span className={`font-bold text-sm px-3 py-1 rounded-lg ${calcWeight >= 250 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              බර: {calcWeight} kg {calcWeight >= 250 ? '✅ AI සඳහා සුදුසුයි!' : '⚠️ තවත් බෑමක් ඕන'}
            </span>
            <button onClick={() => saveWeight(cattleId)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
              💾 සුරකින්න
            </button>
          </>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">සූත්‍රය: Weight(lbs) = (Girth² × Length) ÷ 300</p>
    </div>
  );

  const HeatDatePanel = ({ cattleId }) => (
    <div className="w-full mt-2 bg-orange-50 rounded-lg p-3">
      <p className="text-sm font-semibold text-orange-700 mb-2">🔥 රත් වූ දිනය සලකුණු කරන්න</p>
      <div className="flex gap-2 items-center flex-wrap">
        <input type="date" value={heatDate}
          max={new Date().toISOString().split('T')[0]}
          onChange={e => setHeatDate(e.target.value)}
          className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400" />
        <button onClick={() => saveHeatDate(cattleId)}
          disabled={!heatDate}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50">
          💾 සුරකින්න
        </button>
        <button onClick={() => { setShowHeatForm(null); setHeatDate(''); }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs transition">
          අවලංගු
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1">සටහන: දිනය සුරැකීමෙන් පසු 21 දිනට Predictive Alert ස්වයංක්‍රීයව ලැබේ</p>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-green-700">🧬 සිංචන කළමනාකරණය</h2>
        <button onClick={() => { setShowForm(!showForm); setFormError(''); }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          {showForm ? '✕ අවලංගු' : '+ සිංචන ඉල්ලීම'}
        </button>
      </div>

      {message && (
        <div className={`border px-4 py-3 rounded-xl mb-4 text-sm ${
          message.startsWith('❌') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Predictive Heat Alerts */}
      {heatAlerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-400 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-orange-700 mb-3">🔥 Predictive Alert — රත් වීමේ සංඥා අපේක්ෂිතයි!</h3>
          <div className="space-y-3">
            {heatAlerts.map(c => {
              const nextHeat = new Date(c.lastHeatDate);
              nextHeat.setDate(nextHeat.getDate() + 21);
              const daysUntil = Math.ceil((nextHeat - today) / (1000 * 60 * 60 * 24));
              return (
                <div key={c._id} className="bg-white rounded-lg p-3">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {c.name} <span className="text-gray-400 text-xs">({c.cattleId})</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        අවසන් රත් වීම: {c.lastHeatDate?.split('T')[0]} •
                        ඊළඟ අපේක්ෂිත: {nextHeat.toISOString().split('T')[0]}
                      </p>
                      <p className={`text-xs font-semibold mt-1 ${daysUntil === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                        {daysUntil === 0 ? '⚠️ අද රත් වීමට ඉඩ ඇත! අවධානයෙන් සිටින්න!' :
                         daysUntil === 1 ? '⚠️ හෙට රත් වීමට ඉඩ ඇත! සූදානම් වන්න!' :
                         '⚠️ දින 2කින් රත් වීමට ඉඩ ඇත!'}
                      </p>
                    </div>
                    <button onClick={() => sendAIReadyNotification(c)}
                      disabled={notifying === c._id}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50">
                      {notifying === c._id ? '⏳ යවමින්...' : '📢 LDO ට දැනුම් දෙන්න'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Ready Cattle */}
      {aiReadyCattle.length > 0 && (
        <div className="bg-green-50 border border-green-400 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-green-700 mb-3">✅ AI සිංචන අවධානය — ගව ලිතය</h3>
          <div className="space-y-3">
            {aiReadyCattle.map(c => (
              <div key={c._id} className="bg-white rounded-lg p-3">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {c.name} <span className="text-gray-400 text-xs">({c.cattleId})</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      වයස: මාස {getAgeMonths(c.dob)} •
                      බර: {c.weight ? `${c.weight} kg ${c.weight >= 250 ? '✅' : '⚠️ 250kg+ ඕන'}` : '⚠️ බර ඇතුළත් නොමැත'} •
                      අවසන් රත් වීම: {c.lastHeatDate ? c.lastHeatDate.split('T')[0] : '⚠️ සලකුණු නොමැත'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setShowHeatForm(showHeatForm === c._id ? null : c._id);
                        setShowWeightCalc(null);
                        setHeatDate('');
                      }}
                      className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-medium transition">
                      🔥 රත් වූ දිනය
                    </button>
                    <button
                      onClick={() => {
                        setShowWeightCalc(showWeightCalc === c._id ? null : c._id);
                        setShowHeatForm(null);
                        setGirth(''); setLength(''); setCalcWeight(null);
                      }}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium transition">
                      ⚖️ බර ගණනය
                    </button>
                    {c.weight >= 250 && (
                      <button onClick={() => sendAIReadyNotification(c)}
                        disabled={notifying === c._id}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50">
                        {notifying === c._id ? '⏳ යවමින්...' : '📢 LDO ට දැනුම් දෙන්න'}
                      </button>
                    )}
                  </div>
                </div>

                {showHeatForm === c._id && <HeatDatePanel cattleId={c._id} />}
                {showWeightCalc === c._id && <WeightCalcPanel cattleId={c._id} theme="blue" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">➕ නව සිංචන ඉල්ලීම</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">අපේක්ෂිත දිනය *</label>
              <input type="date" value={form.requestDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setForm({ ...form, requestDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">වර්ගය (Breed Preference)</label>
              <select value={form.breedPreference} onChange={(e) => setForm({ ...form, breedPreference: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="">-- අවශ්‍ය නැත --</option>
                <option value="දේශීය">දේශීය</option>
                <option value="ජර්සි">ජර්සි</option>
                <option value="ෆ්‍රීසියන්">ෆ්‍රීසියන්</option>
                <option value="සහිවාල්">සහිවාල්</option>
                <option value="එයාර්ෂයර්">එයාර්ෂයර්</option>
                <option value="මිශ්‍ර">මිශ්‍ර</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">සටහන්</label>
              <input type="text" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="අතිරේක විස්තර..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition">
              💾 ඉල්ලීම යවන්න
            </button>
            <button onClick={resetForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition">
              අවලංගු
            </button>
          </div>
        </div>
      )}

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🧬</div>
          <p>සිංචන ඉල්ලීම් නොමැත</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">📋 සිංචන ඉල්ලීම් ලිතය</h3>
          {requests.map(r => {
            const s = statusInfo(r.status);
            return (
              <div key={r._id} className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-400">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-gray-800">{r.cattle?.name}</span>
                      <span className="text-gray-400 text-xs">({r.cattle?.cattleId})</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs">අපේක්ෂිත දිනය</span>
                        <p className="text-gray-700">{r.requestDate?.split('T')[0]}</p>
                      </div>
                      {r.breedPreference && (
                        <div>
                          <span className="text-gray-500 text-xs">වර්ගය</span>
                          <p className="text-gray-700">{r.breedPreference}</p>
                        </div>
                      )}
                      {r.notes && (
                        <div>
                          <span className="text-gray-500 text-xs">සටහන්</span>
                          <p className="text-gray-600 text-xs">{r.notes}</p>
                        </div>
                      )}
                    </div>
                    {r.ldoNotes && (
                      <div className="mt-2 bg-blue-50 rounded-lg p-2">
                        <span className="text-xs text-blue-600 font-medium">LDO සටහන්: </span>
                        <span className="text-xs text-blue-700">{r.ldoNotes}</span>
                      </div>
                    )}
                    {r.status === 'completed' && r.bullId && (
                      <div className="mt-2 bg-green-50 rounded-lg p-2 grid grid-cols-2 gap-1 text-xs">
                        <span><b>Bull ID:</b> {r.bullId}</span>
                        <span><b>Batch:</b> {r.batchNo}</span>
                        <span><b>AI Date:</b> {r.aiDate?.split('T')[0]}</span>
                        <span><b>PD Date:</b> {r.pdDate?.split('T')[0]}</span>
                      </div>
                    )}
                  </div>
                  {r.status === 'pending' && (
                    <button onClick={() => handleDelete(r._id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-medium transition">
                      ඉවත් කරන්න
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}