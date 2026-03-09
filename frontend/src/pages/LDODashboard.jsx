import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function LDODashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'farmers', icon: '👨‍🌾', label: 'Farmers' },
    { id: 'airequests', icon: '💉', label: 'AI Requests' },
    { id: 'advice', icon: '📋', label: 'Send Advice' },
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Mobile Header */}
      <div className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between md:hidden sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👨‍💼</span>
          <div>
            <p className="font-bold text-sm">GawaMithuru - LDO</p>
            <p className="text-blue-200 text-xs">{user?.fullName}</p>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white text-2xl">
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {sidebarOpen && (
        <div className="md:hidden bg-blue-800 text-white z-30 shadow-lg">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              className={`w-full text-left px-6 py-3 flex items-center gap-3 border-b border-blue-700 ${
                activeSection === item.id ? 'bg-white text-blue-700 font-semibold' : 'hover:bg-blue-700'
              }`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
          <button onClick={handleLogout} className="w-full text-left px-6 py-3 flex items-center gap-3 bg-red-600">
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      )}

      <div className="flex">
        {/* Sidebar Desktop */}
        <div className="hidden md:flex w-64 bg-blue-700 text-white flex-col min-h-screen sticky top-0">
          <div className="p-6 border-b border-blue-600">
            <div className="text-3xl mb-1">👨‍💼</div>
            <h1 className="text-xl font-bold">GawaMithuru</h1>
            <p className="text-blue-200 text-sm">LDO Dashboard</p>
            <p className="text-blue-300 text-xs mt-1">{user?.fullName}</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${
                  activeSection === item.id ? 'bg-white text-blue-700 font-semibold' : 'hover:bg-blue-600'
                }`}>
                <span>{item.icon}</span><span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4">
            <button onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition">
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8">
          {activeSection === 'home' && <LDOHome />}
          {activeSection === 'farmers' && <FarmersSection />}
          {activeSection === 'airequests' && <AIRequestsSection />}
          {activeSection === 'advice' && <AdviceSection />}
        </div>
      </div>
    </div>
  );
}

// Home Section
function LDOHome() {
  const [stats, setStats] = useState({ farmers: 0, pendingRequests: 0, alerts: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [farmersRes, requestsRes, healthRes] = await Promise.all([
          API.get('/ldo/farmers'),
          API.get('/ldo/ai-requests'),
          API.get('/ldo/health-alerts')
        ]);
        setStats({
          farmers: farmersRes.data.length,
          pendingRequests: requestsRes.data.filter(r => r.status === 'pending').length,
          alerts: healthRes.data.length
        });
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-6">📊 LDO Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <div className="text-3xl mb-2">👨‍🌾</div>
          <div className="text-3xl font-bold text-blue-700">{stats.farmers}</div>
          <div className="text-gray-500 text-sm">Registered Farmers</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
          <div className="text-3xl mb-2">💉</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pendingRequests}</div>
          <div className="text-gray-500 text-sm">Pending AI Requests</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
          <div className="text-3xl mb-2">⚠️</div>
          <div className="text-3xl font-bold text-red-600">{stats.alerts}</div>
          <div className="text-gray-500 text-sm">Health Alerts</div>
        </div>
      </div>
    </div>
  );
}

// Farmers Section
function FarmersSection() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/ldo/farmers')
      .then(res => setFarmers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-6">👨‍🌾 Registered Farmers</h2>
      {farmers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">👨‍🌾</div>
          <p>No farmers registered yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">District</th>
                <th className="px-4 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((f, i) => (
                <tr key={f._id} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  <td className="px-4 py-3 font-medium">{f.fullName}</td>
                  <td className="px-4 py-3">{f.phone}</td>
                  <td className="px-4 py-3">{f.district}</td>
                  <td className="px-4 py-3">{new Date(f.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// AI Requests Section
function AIRequestsSection() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/ldo/ai-requests');
      setRequests(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status, ldoNotes = '') => {
    try {
      await API.put(`/ldo/ai-requests/${id}`, { status, ldoNotes });
      setMessage(`✅ Request ${status}`);
      fetchRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { console.error(err); }
  };

  const statusColor = (s) => {
    switch(s) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-6">💉 AI Insemination Requests</h2>
      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{message}</div>}
      {requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">💉</div><p>No requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r._id} className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-400">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold">{r.farmer?.fullName}</span>
                    <span className="text-gray-400 text-xs">{r.farmer?.phone}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <div><span className="text-gray-500 text-xs">Cattle</span><p>{r.cattle?.name} ({r.cattle?.cattleId})</p></div>
                    <div><span className="text-gray-500 text-xs">Date</span><p>{r.requestDate?.split('T')[0]}</p></div>
                    {r.breedPreference && <div><span className="text-gray-500 text-xs">Breed</span><p>{r.breedPreference}</p></div>}
                  </div>
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(r._id, 'approved')}
                      className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1 rounded-lg text-xs font-medium transition">
                      ✅ Approve
                    </button>
                    <button onClick={() => updateStatus(r._id, 'rejected')}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-medium transition">
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Advice Section
function AdviceSection() {
  const [farmers, setFarmers] = useState([]);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ farmer: '', title: '', content: '', category: 'පෝෂණය' });

  useEffect(() => {
    API.get('/ldo/farmers').then(res => setFarmers(res.data)).catch(err => console.error(err));
  }, []);

  const handleSubmit = async () => {
    setFormError('');
    if (!form.farmer) return setFormError('Select a farmer');
    if (!form.title.trim()) return setFormError('Enter title');
    if (!form.content.trim()) return setFormError('Enter content');

    try {
      await API.post('/ldo/advice', form);
      setMessage('✅ Advice sent successfully');
      setForm({ farmer: '', title: '', content: '', category: 'පෝෂණය' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setFormError('Error sending advice'); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-6">📋 Send Nutrition Advice</h2>
      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{message}</div>}
      <div className="bg-white rounded-xl shadow p-6">
        {formError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">⚠️ {formError}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farmer *</label>
            <select value={form.farmer} onChange={(e) => setForm({ ...form, farmer: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Select Farmer</option>
              {farmers.map(f => <option key={f._id} value={f._id}>{f.fullName} ({f.phone})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="පෝෂණය">🌿 පෝෂණය</option>
              <option value="සෞඛ්‍යය">🏥 සෞඛ්‍යය</option>
              <option value="කිරි නිෂ්පාදනය">🥛 කිරි නිෂ්පාදනය</option>
              <option value="අනෙකුත්">📌 අනෙකුත්</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Advice title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write advice here..." rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>
        <button onClick={handleSubmit}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">
          📤 Send Advice
        </button>
      </div>
    </div>
  );
}