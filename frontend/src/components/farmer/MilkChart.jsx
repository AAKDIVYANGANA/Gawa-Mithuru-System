import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import API from '../../utils/api';

export default function MilkChart() {
  const [records, setRecords] = useState([]);
  const [cattleList, setCattleList] = useState([]);
  const [selectedCattle, setSelectedCattle] = useState('all');
  const [chartType, setChartType] = useState('line');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [milkRes, cattleRes] = await Promise.all([
        API.get('/milk'),
        API.get('/cattle')
      ]);
      setRecords(milkRes.data);
      setCattleList(cattleRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = selectedCattle === 'all'
    ? records
    : records.filter(r => r.cattle?._id === selectedCattle);

  const grouped = {};
  filtered.forEach(r => {
    const date = r.date?.split('T')[0];
    if (!date) return;
    if (!grouped[date]) grouped[date] = { date, උදේ: 0, සවස: 0, මුළු: 0 };
    grouped[date].උදේ += r.morningMilk || 0;
    grouped[date].සවස += r.eveningMilk || 0;
    grouped[date].මුළු += r.totalMilk || 0;
  });

  const chartData = Object.values(grouped)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-14);

  const totalMilk = filtered.reduce((sum, r) => sum + (r.totalMilk || 0), 0);
  const avgMilk = filtered.length > 0 ? (totalMilk / filtered.length).toFixed(1) : 0;
  const maxRecord = filtered.reduce((max, r) => (r.totalMilk || 0) > (max.totalMilk || 0) ? r : max, {});

  if (loading) return <div className="text-center py-10 text-gray-400">දත්ත පූරණය වෙමින්...</div>;

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-green-700 mb-4 md:mb-6">📊 කිරි ප්‍රස්ථාර</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 md:p-4 text-center">
          <p className="text-xs md:text-sm text-green-600">මුළු කිරි (L)</p>
          <p className="text-xl md:text-3xl font-bold text-green-700">{totalMilk.toFixed(1)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 md:p-4 text-center">
          <p className="text-xs md:text-sm text-blue-600">දෛනික සාමාන්‍යය (L)</p>
          <p className="text-xl md:text-3xl font-bold text-blue-700">{avgMilk}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 md:p-4 text-center">
          <p className="text-xs md:text-sm text-yellow-600">වැඩිම දිනය</p>
          <p className="text-xl md:text-3xl font-bold text-yellow-700">{maxRecord.totalMilk || 0} L</p>
          <p className="text-xs text-yellow-500">{maxRecord.date?.split('T')[0] || '-'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 md:mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ගවයා</label>
            <select value={selectedCattle} onChange={(e) => setSelectedCattle(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="all">සියලු ගව</option>
              {cattleList.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.cattleId})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ප්‍රස්ථාර වර්ගය</label>
            <div className="flex gap-2">
              <button onClick={() => setChartType('line')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${chartType === 'line' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                📈 රේඛා
              </button>
              <button onClick={() => setChartType('bar')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${chartType === 'bar' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                📊 තීරු
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4">
          {chartType === 'line' ? '📈' : '📊'} අවසාන දින 14 කිරි අස්වැන්න
        </h3>

        {chartData.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📊</div>
            <p>කිරි දත්ත ඇතුළත් කර නොමැත</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div style={{ minWidth: `${Math.max(chartData.length * 70, 320)}px` }}>
              <ResponsiveContainer width="100%" height={280}>
                {chartType === 'line' ? (
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }}
                      tickFormatter={(val) => val.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value, name) => [`${value} L`, name]}
                      labelFormatter={(label) => `දිනය: ${label}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="උදේ" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="සවස" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="මුළු" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }}
                      tickFormatter={(val) => val.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value, name) => [`${value} L`, name]}
                      labelFormatter={(label) => `දිනය: ${label}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="උදේ" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="සවස" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="මුළු" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}