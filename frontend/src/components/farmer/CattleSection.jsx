import { useState, useEffect } from 'react';
import API from '../../utils/api';

const breeds = ['දේශීය', 'ජර්සි', 'ෆ්‍රීසියන්', 'එයාර්ෂයර්', 'සහිවල්', 'මිශ්‍ර'];
const statuses = ['සෞඛ්‍යසම්පන්න', 'අසනීප', 'ගර්භනී', 'එන්නත් ලැබූ'];

export default function CattleSection() {
  const [cattleList, setCattleList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '', cattleId: '', breed: '', dob: '', status: 'සෞඛ්‍යසම්පන්න'
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchCattle(); }, []);

  const fetchCattle = async () => {
    try {
      const res = await API.get('/cattle');
      setCattleList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const diff = Date.now() - new Date(dob).getTime();
    if (diff < 0) return 'වලංගු දිනයක් දමන්න';
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    if (years > 0) return `අවු. ${years}, මාස ${months}`;
    return `මාස ${months}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setMessage('');

    if (!formData.name.trim()) return setFormError('සතාගේ නම ඇතුළත් කරන්න');
    if (!formData.cattleId.trim()) return setFormError('ටැග් අංකය ඇතුළත් කරන්න');
    if (!formData.breed) return setFormError('වර්ගය තෝරන්න');
    if (!formData.dob) return setFormError('උපන් දිනය තෝරන්න');
    if (formData.dob > today) return setFormError('⚠️ ඉදිරි දිනයක් තෝරා ගත නොහැක!');

    setLoading(true);
    try {
      if (editingId) {
        await API.put(`/cattle/${editingId}`, formData);
        setMessage('ගවයා යාවත්කාලීන කරන ලදී! ✅');
      } else {
        await API.post('/cattle', formData);
        setMessage('ගවයා එකතු කරන ලදී! ✅');
      }
      setFormData({ name: '', cattleId: '', breed: '', dob: '', status: 'සෞඛ්‍යසම්පන්න' });
      setShowForm(false);
      setEditingId(null);
      fetchCattle();
    } catch (err) {
      setFormError(err.response?.data?.message || 'දෝෂයක් ඇතිවිය');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cow) => {
    setFormData({
      name: cow.name,
      cattleId: cow.cattleId,
      breed: cow.breed,
      dob: cow.dob?.split('T')[0],
      status: cow.status
    });
    setEditingId(cow._id);
    setFormError('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ඔබට මෙම ගවයා ඉවත් කිරීමට අවශ්‍යද?')) return;
    try {
      await API.delete(`/cattle/${id}`);
      setMessage('ගවයා ඉවත් කරන ලදී! ✅');
      fetchCattle();
    } catch {
      setMessage('ඉවත් කිරීම අසාර්ථකයි');
    }
  };

  const statusColor = (status) => {
    if (status === 'සෞඛ්‍යසම්පන්න') return 'bg-green-100 text-green-700';
    if (status === 'අසනීප') return 'bg-red-100 text-red-700';
    if (status === 'ගර්භනී') return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-700">🐄 ගව විස්තර</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormError('');
            setFormData({ name: '', cattleId: '', breed: '', dob: '', status: 'සෞඛ්‍යසම්පන්න' });
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          + නව සතෙකු ඇතුළත් කරන්න
        </button>
      </div>

      {message && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4">{message}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {editingId ? '✏️ ගවයා සංස්කරණය කරන්න' : '➕ නව සතෙකු ඇතුළත් කරන්න'}
          </h3>

          {formError && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-4">{formError}</div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">සතාගේ නම</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ටැග් අංකය (Tag No)</label>
              <input type="text" name="cattleId" value={formData.cattleId} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">වර්ගය (Breed)</label>
              <select name="breed" value={formData.breed} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="">වර්ගය තෝරන්න</option>
                {breeds.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">උපන් දිනය</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange}
                max={today}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
              {formData.dob > today && (
                <p className="text-red-500 text-sm mt-1">⚠️ ඉදිරි දිනයක් තෝරා ගත නොහැක!</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">වයස (ස්වයංක්‍රීයව)</label>
              <input type="text" readOnly
                value={formData.dob ? calculateAge(formData.dob) : 'උපන් දිනය තෝරන්න'}
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">වර්තමාන තත්ත්වය</label>
              <select name="status" value={formData.status} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-3 md:col-span-2">
              <button type="submit" disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                {loading ? 'සුරකිමින්...' : editingId ? 'යාවත්කාලීන කරන්න' : 'සුරකින්න'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setFormError(''); }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">
                අවලංගු කරන්න
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-auto">
        {cattleList.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-5xl mb-3">🐄</div>
            <p>තවම ගව විස්තර ඇතුළත් කර නොමැත</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm">නම</th>
                <th className="px-4 py-3 text-left text-sm">ටැග් අංකය</th>
                <th className="px-4 py-3 text-left text-sm">වර්ගය</th>
                <th className="px-4 py-3 text-left text-sm">වයස</th>
                <th className="px-4 py-3 text-left text-sm">තත්ත්වය</th>
                <th className="px-4 py-3 text-left text-sm">ක්‍රියා</th>
              </tr>
            </thead>
            <tbody>
              {cattleList.map((cow, i) => (
                <tr key={cow._id} className={i % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                  <td className="px-4 py-3 font-medium">{cow.name}</td>
                  <td className="px-4 py-3 text-gray-600">{cow.cattleId}</td>
                  <td className="px-4 py-3 text-gray-600">{cow.breed}</td>
                  <td className="px-4 py-3 text-gray-600">{calculateAge(cow.dob)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(cow.status)}`}>
                      {cow.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(cow)}
                      className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-200">
                      ✏️ සංස්කරණය
                    </button>
                    <button onClick={() => handleDelete(cow._id)}
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