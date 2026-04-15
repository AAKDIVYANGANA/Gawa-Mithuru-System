import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import API from '../../utils/api';

export default function MilkReport() {
  const [records, setRecords] = useState([]);
  const [cattleList, setCattleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');
  const [selectedCattle, setSelectedCattle] = useState('all');
  const [view, setView] = useState('summary');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [milkRes, cattleRes] = await Promise.all([
        API.get('/milk'),
        API.get('/cattle')
      ]);
      setRecords(milkRes.data);
      setCattleList(cattleRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Filter by period
  const filterByPeriod = (data) => {
    const days = parseInt(period);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return data.filter(r => new Date(r.date) >= cutoff);
  };

  // Filter by cattle
  const filtered = filterByPeriod(
    selectedCattle === 'all' ? records : records.filter(r => r.cattle?._id === selectedCattle)
  );

  // Group by date
  const byDate = {};
  filtered.forEach(r => {
    const date = r.date?.split('T')[0];
    if (!date) return;
    if (!byDate[date]) byDate[date] = { date, total: 0, morning: 0, evening: 0, count: 0 };
    byDate[date].total += r.totalMilk || 0;
    byDate[date].morning += r.morningMilk || 0;
    byDate[date].evening += r.eveningMilk || 0;
    byDate[date].count += 1;
  });
  const dailyData = Object.values(byDate).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Per-cow summary
  const byCow = {};
  filtered.forEach(r => {
    const id = r.cattle?._id;
    if (!id) return;
    if (!byCow[id]) byCow[id] = { name: r.cattle?.name, cattleId: r.cattle?.cattleId, total: 0, days: 0, max: 0, min: Infinity };
    byCow[id].total += r.totalMilk || 0;
    byCow[id].days += 1;
    byCow[id].max = Math.max(byCow[id].max, r.totalMilk || 0);
    byCow[id].min = Math.min(byCow[id].min, r.totalMilk || 0);
  });
  const cowSummary = Object.values(byCow).sort((a, b) => b.total - a.total);

  // Stats
  const totalMilk = filtered.reduce((s, r) => s + (r.totalMilk || 0), 0);
  const avgDaily = dailyData.length > 0 ? (totalMilk / dailyData.length).toFixed(1) : 0;
  const maxDay = dailyData.reduce((max, d) => d.total > (max?.total || 0) ? d : max, null);
  const minDay = dailyData.reduce((min, d) => d.total < (min?.total || Infinity) ? d : min, null);

  if (loading) return <div className="text-center py-10 text-gray-400">දත්ත පූරණය වෙමින්...</div>;

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-green-700 mb-6">📈 Advanced කිරි නිෂ්පාදන වාර්තාව</h2>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">කාල සීමාව</label>
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
            <option value="7">අවසාන දින 7</option>
            <option value="14">අවසාන දින 14</option>
            <option value="30">අවසාන මාසය</option>
            <option value="90">අවසාන මාස 3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ගවයා</label>
          <select value={selectedCattle} onChange={e => setSelectedCattle(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
            <option value="all">සියලු ගව</option>
            {cattleList.map(c => <option key={c._id} value={c._id}>{c.name} ({c.cattleId})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">දර්ශනය</label>
          <div className="flex gap-2">
            {[
              { id: 'summary', label: '📊 සාරාංශය' },
              { id: 'chart', label: '📈 ප්‍රස්ථාරය' },
              { id: 'table', label: '📋 වගුව' },
              { id: 'cows', label: '🐄 ගව සැසඳීම' },
            ].map(v => (
              <button key={v.id} onClick={() => setView(v.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                  view === v.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-xs text-green-600">මුළු කිරි</p>
          <p className="text-2xl font-bold text-green-700">{totalMilk.toFixed(1)}L</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-xs text-blue-600">දෛනික සාමාන්‍යය</p>
          <p className="text-2xl font-bold text-blue-700">{avgDaily}L</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-xs text-yellow-600">වැඩිම දිනය</p>
          <p className="text-xl font-bold text-yellow-700">{maxDay?.total?.toFixed(1) || 0}L</p>
          <p className="text-xs text-yellow-500">{maxDay?.date || '-'}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-xs text-red-600">අඩුම දිනය</p>
          <p className="text-xl font-bold text-red-700">{minDay?.total?.toFixed(1) || 0}L</p>
          <p className="text-xs text-red-500">{minDay?.date || '-'}</p>
        </div>
      </div>

      {/* Summary View */}
      {view === 'summary' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold text-gray-700 mb-4">📊 දෛනික කිරි නිෂ්පාදනය</h3>
            {dailyData.length === 0 ? (
              <p className="text-center text-gray-400 py-8">දත්ත නොමැත</p>
            ) : (
              <div className="overflow-x-auto">
                <div style={{ minWidth: `${Math.max(dailyData.length * 60, 300)}px` }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v, n) => [`${v.toFixed(1)}L`, n]} labelFormatter={l => `දිනය: ${l}`} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="morning" name="උදේ" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="evening" name="සවස" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Weekly Summary */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold text-gray-700 mb-3">📅 සතිපතා සාරාංශය</h3>
            {(() => {
              const weeks = {};
              dailyData.forEach(d => {
                const date = new Date(d.date);
                const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
                if (!weeks[week]) weeks[week] = { week, total: 0, days: 0 };
                weeks[week].total += d.total;
                weeks[week].days += 1;
              });
              const weekArr = Object.values(weeks);
              if (weekArr.length === 0) return <p className="text-gray-400 text-sm">දත්ත නොමැත</p>;
              return (
                <div className="space-y-2">
                  {weekArr.map((w, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">සතිය {i + 1} ({w.days} දින)</span>
                      <div className="text-right">
                        <span className="font-bold text-green-700">{w.total.toFixed(1)}L</span>
                        <span className="text-xs text-gray-400 ml-2">සාමාන්‍යය: {(w.total / w.days).toFixed(1)}L/දිනකට</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Chart View */}
      {view === 'chart' && (
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold text-gray-700 mb-4">📈 කිරි නිෂ්පාදන ප්‍රස්ථාරය</h3>
          {dailyData.length === 0 ? (
            <p className="text-center text-gray-400 py-8">දත්ත නොමැත</p>
          ) : (
            <div className="overflow-x-auto">
              <div style={{ minWidth: `${Math.max(dailyData.length * 60, 300)}px` }}>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v, n) => [`${v.toFixed(1)}L`, n]} labelFormatter={l => `දිනය: ${l}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="morning" name="උදේ" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="evening" name="සවස" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="total" name="මුළු" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">📋 සවිස්තර වගුව</h3>
            <span className="text-xs text-gray-400">වාර්තා {filtered.length}ක්</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">දිනය</th>
                  <th className="px-4 py-3 text-left">ගවයා</th>
                  <th className="px-4 py-3 text-left">උදේ (L)</th>
                  <th className="px-4 py-3 text-left">සවස (L)</th>
                  <th className="px-4 py-3 text-left">මුළු (L)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">දත්ත නොමැත</td></tr>
                ) : filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map((r, i) => (
                  <tr key={r._id} className={i % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                    <td className="px-4 py-2">{r.date?.split('T')[0]}</td>
                    <td className="px-4 py-2">{r.cattle?.name} <span className="text-gray-400 text-xs">({r.cattle?.cattleId})</span></td>
                    <td className="px-4 py-2 text-blue-600">{r.morningMilk}</td>
                    <td className="px-4 py-2 text-yellow-600">{r.eveningMilk}</td>
                    <td className="px-4 py-2 font-bold text-green-600">{r.totalMilk}</td>
                  </tr>
                ))}
              </tbody>
              {filtered.length > 0 && (
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td className="px-4 py-2" colSpan={2}>මුළු එකතුව</td>
                    <td className="px-4 py-2 text-blue-600">
                      {filtered.reduce((s, r) => s + (r.morningMilk || 0), 0).toFixed(1)}
                    </td>
                    <td className="px-4 py-2 text-yellow-600">
                      {filtered.reduce((s, r) => s + (r.eveningMilk || 0), 0).toFixed(1)}
                    </td>
                    <td className="px-4 py-2 text-green-600">
                      {filtered.reduce((s, r) => s + (r.totalMilk || 0), 0).toFixed(1)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Cow Comparison View */}
      {view === 'cows' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold text-gray-700 mb-4">🐄 ගව නිෂ්පාදන සැසඳීම</h3>
            {cowSummary.length === 0 ? (
              <p className="text-center text-gray-400 py-8">දත්ත නොමැත</p>
            ) : (
              <div className="space-y-4">
                {cowSummary.map((c, i) => {
                  const avg = c.days > 0 ? (c.total / c.days).toFixed(1) : 0;
                  const maxTotal = cowSummary[0]?.total || 1;
                  const pct = ((c.total / maxTotal) * 100).toFixed(0);
                  return (
                    <div key={i} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-bold text-gray-800">{c.name}</span>
                          <span className="text-gray-400 text-xs ml-2">({c.cattleId})</span>
                          {i === 0 && <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">🏆 Top</span>}
                        </div>
                        <span className="text-lg font-bold text-green-600">{c.total.toFixed(1)}L</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                        <span>සාමාන්‍යය: <b className="text-gray-700">{avg}L/දිනකට</b></span>
                        <span>වැඩිම: <b className="text-green-600">{c.max?.toFixed(1)}L</b></span>
                        <span>අඩුම: <b className="text-red-500">{c.min === Infinity ? 0 : c.min?.toFixed(1)}L</b></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bar comparison chart */}
          {cowSummary.length > 0 && (
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="font-semibold text-gray-700 mb-4">📊 ගව නිෂ්පාදන ප්‍රස්ථාරය</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={cowSummary} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v.toFixed(1)}L`, 'මුළු කිරි']} />
                  <Bar dataKey="total" name="මුළු කිරි" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}