import { useState, useEffect } from 'react';
import API from '../../utils/api';

export default function MilkInput() {
  const [cattleList, setCattleList] = useState([]);
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    cattle: '', morningMilk: '', eveningMilk: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchCattle(); fetchRecords(); }, []);

  const fetchCattle = async () => {
    try { const res = await API.get('/cattle'); setCattleList(res.data); }
    catch (err) { console.error(err); }
  };

  const fetchRecords = async () => {
    try { const res = await API.get('/milk'); setRecords(res.data); }
    catch (err) { console.error(err); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'morningMilk' || name === 'eveningMilk') && parseFloat(value) < 0) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.date > today) {
      return setError('⚠️ ඉදිරි දිනයක් සඳහා කිරි දත්ත ඇතුළත් කළ නොහැක!');
    }
    if (parseFloat(formData.morningMilk) < 0 || parseFloat(formData.eveningMilk) < 0) {
      return setError('⚠️ කිරි ප්‍රමාණය සෘණ අගයක් විය නොහැක!');
    }

    setLoading(true);
    try {
      if (editingId) {
        await API.put(`/milk/${editingId}`, formData);
        setMessage('කිරි දත්ත යාවත්කාලීන කරන ලදී! ✅');
      } else {
        await API.post('/milk', formData);
        setMessage('කිරි දත්ත සුරකින ලදී! ✅');
      }
      setFormData({ cattle: '', morningMilk: '', eveningMilk: '', date: today });
      setEditingId(null);
      fetchRecords();
    } catch {
      setError('දෝෂයක් ඇතිවිය');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setFormData({
      cattle: record.cattle?._id,
      morningMilk: record.morningMilk,
      eveningMilk: record.eveningMilk,
      date: record.date?.split('T')[0]
    });
    setEditingId(record._id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('මෙම කිරි වාර්තාව ඉවත් කිරීමට අවශ්‍යද?')) return;
    try {
      await API.delete(`/milk/${id}`);
      setMessage('කිරි වාර්තාව ඉවත් කරන ලදී! ✅');
      fetchRecords();
    } catch {
      setError('ඉවත් කිරීම අසාර්ථකයි');
    }
  };

  const todayTotal = records
    .filter(r => r.date?.split('T')[0] === today)
    .reduce((sum, r) => sum + (r.totalMilk || 0), 0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-green-700 mb-2"> දෛනික කිරි අස්වැන්න</h2>

      {/* Today summary */}
      <div className="bg-yellow-100 border border-yellow-100 rounded-xl p-4 mb-6 flex items-center gap-3">
        <span className="text-3xl">🍶</span>
        <div>
          <p className="text-sm text-yellow-600">අද දින මුළු කිරි</p>
          <p className="text-2xl font-bold text-yellow-800">{todayTotal.toFixed(1)} ලීටර්</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {editingId ? '✏️ කිරි දත්ත සංස්කරණය' : 'කිරි ප්‍රමාණය ඇතුළත් කරන්න'}
        </h3>

        {message && <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ගවයා තෝරන්න</label>
            <select name="cattle" value={formData.cattle} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="">ගවයා තෝරන්න</option>
              {cattleList.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.cattleId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">දිනය</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required
              max={today}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            {formData.date > today && (
              <p className="text-red-500 text-sm mt-1">⚠️ ඉදිරි දිනයක් තෝරා ගත නොහැක!</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">උදේ කිරි (ලීටර්)</label>
            <input type="number" name="morningMilk" value={formData.morningMilk} onChange={handleChange}
              min="0" step="0.1" required placeholder="0.0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">සවස කිරි (ලීටර්)</label>
            <input type="number" name="eveningMilk" value={formData.eveningMilk} onChange={handleChange}
              min="0" step="0.1" required placeholder="0.0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>

          {formData.morningMilk && formData.eveningMilk && (
            <div className="md:col-span-2 bg-green-50 rounded-lg p-3">
              <p className="text-green-700 font-semibold">
                🥛 මුළු කිරි: {(parseFloat(formData.morningMilk || 0) + parseFloat(formData.eveningMilk || 0)).toFixed(1)} ලීටර්
              </p>
            </div>
          )}

          <div className="md:col-span-2 flex gap-3">
            <button type="submit" disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
              {loading ? 'සුරකිමින්...' : editingId ? 'යාවත්කාලීන කරන්න' : 'සුරකින්න'}
            </button>
            {editingId && (
              <button type="button" onClick={() => {
                setEditingId(null);
                setFormData({ cattle: '', morningMilk: '', eveningMilk: '', date: today });
                setError(''); setMessage('');
              }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">
                අවලංගු කරන්න
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow overflow-auto">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700">📋 කිරි වාර්තා</h3>
        </div>
        {records.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">🥛</div>
            <p>තවම කිරි දත්ත ඇතුළත් කර නොමැත</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm">ගවයා</th>
                <th className="px-4 py-3 text-left text-sm">දිනය</th>
                <th className="px-4 py-3 text-left text-sm">උදේ (L)</th>
                <th className="px-4 py-3 text-left text-sm">සවස (L)</th>
                <th className="px-4 py-3 text-left text-sm">මුළු (L)</th>
                <th className="px-4 py-3 text-left text-sm">ක්‍රියා</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r._id} className={i % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                  <td className="px-4 py-3">{r.cattle?.name}</td>
                  <td className="px-4 py-3">{r.date?.split('T')[0]}</td>
                  <td className="px-4 py-3">{r.morningMilk}</td>
                  <td className="px-4 py-3">{r.eveningMilk}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">{r.totalMilk}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(r)}
                      className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-200">
                      ✏️ සංස්කරණය
                    </button>
                    <button onClick={() => handleDelete(r._id)}
                      className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-200">
                      🗑️ ඉවත් කරන්න
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}