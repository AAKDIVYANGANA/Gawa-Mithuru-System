import { useState, useEffect } from 'react';
import API from '../../utils/api';

export default function AdviceFeed() {
  const [advice, setAdvice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchAdvice(); }, []);

  const fetchAdvice = async () => {
    try {
      const res = await API.get('/advice');
      setAdvice(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await API.put(`/advice/${id}/read`);
      setAdvice(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const categoryColor = (cat) => {
    switch (cat) {
      case 'පෝෂණය': return 'bg-green-100 text-green-700';
      case 'සෞඛ්‍යය': return 'bg-red-100 text-red-700';
      case 'කිරි නිෂ්පාදනය': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filtered = filter === 'all' ? advice
    : filter === 'unread' ? advice.filter(a => !a.isRead)
    : advice.filter(a => a.category === filter);

  const unreadCount = advice.filter(a => !a.isRead).length;

  if (loading) return <div className="text-center py-10 text-gray-400">දත්ත පූරණය වෙමින්...</div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-green-700">📋 ලැබුණු උපදෙස්</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'සියල්ල' },
          { key: 'unread', label: '📬 නොකියවූ' },
          { key: 'පෝෂණය', label: '🌿 පෝෂණය' },
          { key: 'සෞඛ්‍යය', label: '🏥 සෞඛ්‍යය' },
          { key: 'කිරි නිෂ්පාදනය', label: '🥛 කිරි' },
          { key: 'අනෙකුත්', label: '📌 අනෙකුත්' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === f.key
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Advice List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p>උපදෙස් නොමැත</p>
          
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(a => (
            <div key={a._id}
              className={`bg-white rounded-xl shadow p-4 border-l-4 transition ${
                a.isRead ? 'border-gray-200 opacity-80' : 'border-green-500'
              }`}>
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-gray-800">{a.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor(a.category)}`}>
                      {a.category}
                    </span>
                    {!a.isRead && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        නව
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">{a.content}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span>👨‍💼 {a.ldo?.fullName || 'LDO නිලධාරී'}</span>
                    <span>📅 {new Date(a.createdAt).toLocaleDateString('si-LK')}</span>
                  </div>
                </div>
                {!a.isRead && (
                  <button onClick={() => markRead(a._id)}
                    className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap">
                    ✅ කියවා ඇත
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}