import { useState, useEffect } from 'react';
import API from '../../utils/api';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/prescriptions')
      .then(res => setPrescriptions(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-400">දත්ත පූරණය වෙමින්...</div>;

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-green-700 mb-6">💊 වෛද්‍ය බෙහෙත් වට්ටෝරු</h2>

      {prescriptions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">💊</div>
          <p>බෙහෙත් වට්ටෝරු නොමැත</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(p => (
            <div key={p._id} className="bg-white rounded-xl shadow p-4 border-l-4 border-purple-400">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">🐄 {p.cattle?.name}</span>
                    <span className="text-gray-400 text-xs">({p.cattle?.cattleId})</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>{p.status === 'active' ? '🔵 Active' : '✅ Completed'}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    👨‍⚕️ {p.vet?.fullName} • 📅 {p.createdAt?.split('T')[0]}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-purple-500 mb-1">රෝගය (Diagnosis)</p>
                  <p className="font-semibold text-gray-800 text-sm">{p.diagnosis}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-500 mb-1">බෙහෙත (Medication)</p>
                  <p className="font-semibold text-gray-800 text-sm">{p.medication}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-500 mb-1">ප්‍රමාණය (Dosage)</p>
                  <p className="font-semibold text-gray-800 text-sm">{p.dosage}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-xs text-yellow-500 mb-1">කාලය (Duration)</p>
                  <p className="font-semibold text-gray-800 text-sm">{p.duration}</p>
                </div>
              </div>

              {p.notes && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">📝 සටහන්: {p.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}