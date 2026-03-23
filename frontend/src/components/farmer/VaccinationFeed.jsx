import { useState, useEffect } from 'react';
import API from '../../utils/api';

export default function VaccinationFeed() {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchVaccinations(); }, []);

  const fetchVaccinations = async () => {
    try {
      const res = await API.get('/vaccinations');
      setVaccinations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const upcoming = vaccinations.filter(v => v.status === 'scheduled');
  const completed = vaccinations.filter(v => v.status === 'completed');

  const getDaysLeft = (date) => {
    const today = new Date();
    const scheduled = new Date(date);
    const diff = Math.ceil((scheduled - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) return <div className="text-center py-10 text-gray-400">දත්ත පූරණය වෙමින්...</div>;

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-green-700 mb-6">💉 එන්නත් කාලසටහන</h2>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">{upcoming.length}</div>
          <div className="text-sm text-yellow-600">ඉදිරි එන්නත්</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{completed.length}</div>
          <div className="text-sm text-green-600">සම්පූර්ණ එන්නත්</div>
        </div>
      </div>

      {/* Upcoming */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">📅 ඉදිරි එන්නත් ({upcoming.length})</h3>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-gray-400 shadow-sm">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-sm">ඉදිරි එන්නත් නොමැත</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(v => {
              const daysLeft = getDaysLeft(v.scheduledDate);
              return (
                <div key={v._id}
                  className={`bg-white rounded-xl shadow p-4 border-l-4 ${
                    daysLeft <= 3 ? 'border-red-500' :
                    daysLeft <= 7 ? 'border-yellow-500' :
                    'border-blue-400'
                  }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800">{v.cattle?.name}</span>
                        <span className="text-gray-400 text-xs">({v.cattle?.cattleId})</span>
                        {daysLeft <= 3 && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
                            ⚠️ හදිසි
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-700">💉 {v.vaccineName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        📅 {v.scheduledDate?.split('T')[0]}
                        {v.notes && ` • ${v.notes}`}
                      </p>
                    </div>
                    <div className={`text-center px-3 py-1 rounded-lg text-xs font-bold ${
                      daysLeft < 0 ? 'bg-red-100 text-red-600' :
                      daysLeft === 0 ? 'bg-orange-100 text-orange-600' :
                      daysLeft <= 3 ? 'bg-red-50 text-red-500' :
                      daysLeft <= 7 ? 'bg-yellow-50 text-yellow-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {daysLeft < 0 ? 'අතීත' :
                       daysLeft === 0 ? 'අද' :
                       `දින ${daysLeft}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">✅ සම්පූර්ණ ({completed.length})</h3>
          <div className="space-y-3">
            {completed.map(v => (
              <div key={v._id} className="bg-white rounded-xl shadow p-4 border-l-4 border-green-400 opacity-75">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-700">{v.cattle?.name}</span>
                    <span className="text-gray-400 text-xs ml-2">({v.cattle?.cattleId})</span>
                    <p className="text-sm text-gray-500">💉 {v.vaccineName}</p>
                    <p className="text-xs text-gray-400">
                      සම්පූර්ණ: {v.completedDate?.split('T')[0] || v.scheduledDate?.split('T')[0]}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">✅ සම්පූර්ණ</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {vaccinations.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">💉</div>
          <p>එන්නත් කාලසටහන නොමැත</p>
          <p className="text-sm mt-1">LDO නිලධාරී විසින් එන්නත් සලකුණු කරනු ඇත</p>
        </div>
      )}
    </div>
  );
}