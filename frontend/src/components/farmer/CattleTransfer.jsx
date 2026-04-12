import { useState, useEffect } from 'react';
import API from '../../utils/api';

export default function CattleTransfer() {
  const [cattleList, setCattleList] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [foundFarmer, setFoundFarmer] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    cattleId: '', toFarmerPhone: '', transferDate: '', salePrice: '', reason: '', notes: ''
  });

  const reasons = [
    'විකිණීම (Sale)',
    'තෑග්ගක් ලෙස (Gift)',
    'කොටස් හුවමාරුව (Share)',
    'වෙනත් (Other)'
  ];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [cattleRes, transferRes] = await Promise.all([
        API.get('/cattle'),
        API.get('/transfers')
      ]);
      setCattleList(cattleRes.data);
      setTransfers(transferRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const searchFarmer = async () => {
    if (!form.toFarmerPhone || form.toFarmerPhone.length < 10) {
      setFormError('දුරකථන අංකය ඇතුළත් කරන්න');
      return;
    }
    setSearching(true);
    setFoundFarmer(null);
    setFormError('');
    try {
      const res = await API.get(`/transfers/find-farmer/${form.toFarmerPhone}`);
      setFoundFarmer(res.data);
    } catch (err) {
      setFormError(err.response?.data?.message || 'ගොවියා හමු නොවීය');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!form.cattleId) return setFormError('ගවයා තෝරන්න');
    if (!foundFarmer) return setFormError('නව හිමිකරු සොයන්න');
    if (!form.transferDate) return setFormError('transfer දිනය ඇතුළත් කරන්න');

    if (!window.confirm(`"${cattleList.find(c => c._id === form.cattleId)?.name}" ගවයා ${foundFarmer.fullName} ට transfer කරන්නද? මෙය ආපසු හැරවිය නොහැක!`)) return;

    setSubmitting(true);
    try {
      await API.post('/transfers', {
        cattleId: form.cattleId,
        toFarmerPhone: form.toFarmerPhone,
        transferDate: form.transferDate,
        salePrice: form.salePrice || undefined,
        reason: form.reason,
        notes: form.notes
      });
      setMessage('✅ ගවයා සාර්ථකව transfer කරන ලදී!');
      setShowForm(false);
      setForm({ cattleId: '', toFarmerPhone: '', transferDate: '', salePrice: '', reason: '', notes: '' });
      setFoundFarmer(null);
      fetchData();
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Transfer අසාර්ථකයි');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ cattleId: '', toFarmerPhone: '', transferDate: '', salePrice: '', reason: '', notes: '' });
    setFoundFarmer(null);
    setFormError('');
    setShowForm(false);
  };

  if (loading) return <div className="text-center py-10 text-gray-400">දත්ත පූරණය වෙමින්...</div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-green-700">🔄 ගව හිමිකාරිත්ව මාරුව</h2>
        {cattleList.length > 0 && (
          <button onClick={() => { setShowForm(!showForm); setFormError(''); setFoundFarmer(null); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            {showForm ? '✕ අවලංගු' : '+ ගවයා Transfer කරන්න'}
          </button>
        )}
      </div>

      {message && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
          {message}
        </div>
      )}

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6">
        <p className="text-yellow-800 text-sm font-semibold">⚠️ වැදගත් දැනුම්දීම</p>
        <p className="text-yellow-700 text-xs mt-1">
          ගවයා transfer කළ පසු ඔබේ ගිණුමෙන් ඉවත් වේ. LDO නිලධාරීට ස්වයංක්‍රීයව දැනුම් දෙනු ලැබේ.
          Transfer ආපසු හැරවිය නොහැක.
        </p>
      </div>

      {/* Transfer Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-5 mb-6 border border-orange-200">
          <h3 className="font-bold text-orange-700 mb-4">🔄 ගවයා Transfer කරන්න</h3>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
              ⚠️ {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Cattle Select */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Transfer කරන ගවයා *</label>
              <select value={form.cattleId} onChange={e => setForm({ ...form, cattleId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">ගවයා තෝරන්න</option>
                {cattleList.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.cattleId}) — {c.breed} — {c.status}
                  </option>
                ))}
              </select>
              {form.cattleId && (() => {
                const selected = cattleList.find(c => c._id === form.cattleId);
                return selected ? (
                  <div className="mt-2 bg-orange-50 rounded-lg p-2 text-xs text-orange-700">
                    🐄 {selected.name} • {selected.breed} • DOB: {selected.dob?.split('T')[0]} • {selected.status}
                  </div>
                ) : null;
              })()}
            </div>

            {/* New Owner Phone */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">නව හිමිකරුගේ දුරකථන අංකය *</label>
              <div className="flex gap-2">
                <input type="tel" value={form.toFarmerPhone} maxLength={10}
                  onChange={e => { setForm({ ...form, toFarmerPhone: e.target.value }); setFoundFarmer(null); setFormError(''); }}
                  placeholder="0771234567"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <button onClick={searchFarmer} disabled={searching}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
                  {searching ? '⏳' : '🔍 සොයන්න'}
                </button>
              </div>

              {/* Found Farmer */}
              {foundFarmer && (
                <div className="mt-2 bg-green-50 border border-green-300 rounded-lg p-3">
                  <p className="text-green-700 font-semibold text-sm">✅ ගොවියා හමු විය:</p>
                  <p className="text-green-800 text-sm">👨‍🌾 {foundFarmer.fullName}</p>
                  <p className="text-green-600 text-xs">📱 {foundFarmer.phone} • 📍 {foundFarmer.district}</p>
                </div>
              )}
            </div>

            {/* Transfer Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transfer දිනය *</label>
              <input type="date" value={form.transferDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({ ...form, transferDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>

            {/* Sale Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">විකුණු මිල (Rs.) — අවශ්‍ය නැත</label>
              <input type="number" value={form.salePrice} min="0"
                onChange={e => setForm({ ...form, salePrice: e.target.value })}
                placeholder="e.g. 150000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">හේතුව</label>
              <select value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">හේතුව තෝරන්න</option>
                {reasons.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">සටහන්</label>
              <input type="text" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="අතිරේක විස්තර..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={handleSubmit} disabled={submitting || !foundFarmer}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50">
              {submitting ? '⏳ Transfer වෙමින්...' : '🔄 Transfer කරන්න'}
            </button>
            <button onClick={resetForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition">
              අවලංගු
            </button>
          </div>
        </div>
      )}

      {/* Transfer History */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-4">📋 Transfer ඉතිහාසය</h3>
        {transfers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🔄</div>
            <p>Transfer ඉතිහාසය නොමැත</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.map(t => {
              return (
                <div key={t._id} className={`bg-white rounded-xl shadow p-4 border-l-4 ${
                  'border-orange-400'
                }`}>
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-bold text-gray-800">🐄 {t.cattle?.name}</span>
                        <span className="text-gray-400 text-xs">({t.cattle?.cattleId})</span>
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                          {t.cattle?.breed}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500 text-xs">ගෙන් (From)</span>
                          <p className="text-gray-700 font-medium">{t.fromFarmer?.fullName}</p>
                          <p className="text-gray-400 text-xs">{t.fromFarmer?.phone}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">ට (To)</span>
                          <p className="text-gray-700 font-medium">{t.toFarmer?.fullName}</p>
                          <p className="text-gray-400 text-xs">{t.toFarmer?.phone}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">දිනය</span>
                          <p className="text-gray-700">{t.transferDate?.split('T')[0]}</p>
                        </div>
                        {t.salePrice && (
                          <div>
                            <span className="text-gray-500 text-xs">මිල</span>
                            <p className="text-green-700 font-semibold">Rs. {t.salePrice?.toLocaleString()}</p>
                          </div>
                        )}
                        {t.reason && (
                          <div>
                            <span className="text-gray-500 text-xs">හේතුව</span>
                            <p className="text-gray-600 text-xs">{t.reason}</p>
                          </div>
                        )}
                        {t.notes && (
                          <div>
                            <span className="text-gray-500 text-xs">සටහන්</span>
                            <p className="text-gray-600 text-xs">{t.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}