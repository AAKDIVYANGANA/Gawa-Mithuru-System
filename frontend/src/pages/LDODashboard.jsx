import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../utils/api';

export default function LDODashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { section } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSection = section || 'home';
  const handleLogout = () => { logout(); navigate('/login'); };

  const setActiveSection = (id) => {
    navigate(id === 'home' ? '/ldo' : `/ldo/${id}`);
    setSidebarOpen(false);
  };

  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Dashboard Home' },
    { id: 'directory', icon: '👨‍🌾', label: 'Farmer & Cattle Directory' },
    { id: 'ai', icon: '💉', label: 'AI Management' },
    { id: 'vaccination', icon: '📅', label: 'Vaccination Tracker' },
    { id: 'advice', icon: '🌾', label: 'Nutrition Advice' },
    { id: 'history', icon: '📜', label: 'Cattle Full History' },
    { id: 'milk', icon: '🥛', label: 'Milk Analytics' },
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
                <span>{item.icon}</span><span className="text-sm">{item.label}</span>
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
          {activeSection === 'home' && <HomeSection setActiveSection={setActiveSection} />}
          {activeSection === 'directory' && <DirectorySection />}
          {activeSection === 'ai' && <AISection />}
          {activeSection === 'vaccination' && <VaccinationSection />}
          {activeSection === 'advice' && <AdviceSection />}
          {activeSection === 'history' && <HistorySection />}
          {activeSection === 'milk' && <MilkAnalyticsSection />}
        </div>
      </div>
    </div>
  );
}

// Home Section
function HomeSection({ setActiveSection }) {
  const [stats, setStats] = useState({ farmers: 0, cattle: 0, pendingAI: 0, upcomingVaccinations: 0 });

  useEffect(() => {
    API.get('/ldo/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-6">📊 Dashboard Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="👨‍🌾" label="Registered Farmers" value={stats.farmers} color="bg-blue-100 text-blue-700" onClick={() => setActiveSection('directory')} />
        <StatCard icon="🐄" label="Total Cattle" value={stats.cattle} color="bg-green-100 text-green-700" onClick={() => setActiveSection('directory')} />
        <StatCard icon="💉" label="Pending AI Requests" value={stats.pendingAI} color="bg-yellow-100 text-yellow-700" onClick={() => setActiveSection('ai')} />
        <StatCard icon="📅" label="Upcoming Vaccinations" value={stats.upcomingVaccinations} color="bg-purple-100 text-purple-700" onClick={() => setActiveSection('vaccination')} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: '👨‍🌾', label: 'Farmer Directory', id: 'directory' },
          { icon: '💉', label: 'AI Management', id: 'ai' },
          { icon: '📅', label: 'Vaccinations', id: 'vaccination' },
          { icon: '🥛', label: 'Milk Analytics', id: 'milk' },
        ].map(q => (
          <button key={q.id} onClick={() => setActiveSection(q.id)}
            className="bg-white rounded-xl p-4 text-center shadow hover:bg-blue-50 transition border border-blue-100">
            <div className="text-2xl mb-1">{q.icon}</div>
            <div className="text-xs text-blue-700 font-medium">{q.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div onClick={onClick} className={`${color} rounded-xl p-4 cursor-pointer hover:opacity-80 transition`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs mt-1">{label}</div>
    </div>
  );
}

// Directory Section
function DirectorySection() {
  const [cattle, setCattle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/ldo/cattle')
      .then(res => setCattle(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cattle.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.farmer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.cattleId?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-4">👨‍🌾 Farmer & Cattle Directory</h2>
      <input type="text" placeholder="Search by farmer, cattle name or tag..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Farmer</th>
              <th className="px-4 py-3 text-left">Cattle Name</th>
              <th className="px-4 py-3 text-left">Tag No</th>
              <th className="px-4 py-3 text-left">Breed</th>
              <th className="px-4 py-3 text-left">DOB</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No cattle found</td></tr>
            ) : filtered.map((c, i) => (
              <tr key={c._id} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                <td className="px-4 py-3">{c.farmer?.fullName}<br/><span className="text-xs text-gray-400">{c.farmer?.phone}</span></td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.cattleId}</td>
                <td className="px-4 py-3">{c.breed}</td>
                <td className="px-4 py-3">{c.dob?.split('T')[0]}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.status === 'සෞඛ්‍යසම්පන්න' ? 'bg-green-100 text-green-700' :
                    c.status === 'අසනීප' ? 'bg-red-100 text-red-700' :
                    c.status === 'ගර්භනී' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// AI Management Section
function AISection() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);
  const [aiDetails, setAiDetails] = useState({ bullId: '', semenBreed: '', batchNo: '', aiDate: '', pdDate: '', ldoNotes: '' });

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/ldo/ai-requests');
      setRequests(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/ldo/ai-requests/${id}`, { status });
      setMessage(`✅ Request ${status}`);
      fetchRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { console.error(err); }
  };

  const saveAIDetails = async (id) => {
    try {
      await API.put(`/ldo/ai-requests/${id}`, { ...aiDetails, status: 'completed' });
      setMessage('✅ AI details saved');
      setEditId(null);
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
      <h2 className="text-2xl font-bold text-blue-700 mb-6">💉 AI Management</h2>
      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{message}</div>}
      {requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">💉</div><p>No AI requests yet</p></div>
      ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r._id} className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-400">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold">{r.farmer?.fullName}</span>
                    <span className="text-gray-400 text-xs">{r.farmer?.phone}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(r.status)}`}>{r.status}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><span className="text-gray-500 text-xs">Cattle</span><p>{r.cattle?.name} ({r.cattle?.cattleId})</p></div>
                    <div><span className="text-gray-500 text-xs">Requested Date</span><p>{r.requestDate?.split('T')[0]}</p></div>
                    {r.breedPreference && <div><span className="text-gray-500 text-xs">Breed Pref</span><p>{r.breedPreference}</p></div>}
                    {r.notes && <div><span className="text-gray-500 text-xs">Notes</span><p className="text-xs">{r.notes}</p></div>}
                  </div>
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(r._id, 'approved')}
                      className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1 rounded-lg text-xs font-medium transition">✅ Approve</button>
                    <button onClick={() => updateStatus(r._id, 'rejected')}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-medium transition">❌ Reject</button>
                  </div>
                )}
                {r.status === 'approved' && (
                  <button onClick={() => { setEditId(r._id); setAiDetails({ bullId: '', semenBreed: '', batchNo: '', aiDate: '', pdDate: '', ldoNotes: '' }); }}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-medium transition">📝 Record AI</button>
                )}
              </div>

              {/* AI Details Form */}
              {editId === r._id && (
                <div className="border-t pt-3 mt-2">
                  <p className="text-sm font-semibold text-blue-700 mb-3">📝 Record AI Completion</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div><label className="text-xs text-gray-600">Bull ID</label>
                      <input type="text" value={aiDetails.bullId} onChange={e => setAiDetails({...aiDetails, bullId: e.target.value})}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" /></div>
                    <div><label className="text-xs text-gray-600">Semen Breed</label>
                      <input type="text" value={aiDetails.semenBreed} onChange={e => setAiDetails({...aiDetails, semenBreed: e.target.value})}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" /></div>
                    <div><label className="text-xs text-gray-600">Batch No</label>
                      <input type="text" value={aiDetails.batchNo} onChange={e => setAiDetails({...aiDetails, batchNo: e.target.value})}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" /></div>
                    <div><label className="text-xs text-gray-600">AI Date</label>
                      <input type="date" value={aiDetails.aiDate} onChange={e => setAiDetails({...aiDetails, aiDate: e.target.value})}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" /></div>
                    <div><label className="text-xs text-gray-600">PD Date</label>
                      <input type="date" value={aiDetails.pdDate} onChange={e => setAiDetails({...aiDetails, pdDate: e.target.value})}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" /></div>
                    <div><label className="text-xs text-gray-600">LDO Notes</label>
                      <input type="text" value={aiDetails.ldoNotes} onChange={e => setAiDetails({...aiDetails, ldoNotes: e.target.value})}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" /></div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => saveAIDetails(r._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm transition">💾 Save</button>
                    <button onClick={() => setEditId(null)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-sm transition">Cancel</button>
                  </div>
                </div>
              )}

              {/* Completed AI Details */}
              {r.status === 'completed' && r.bullId && (
                <div className="border-t pt-3 mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div><span className="text-gray-500">Bull ID:</span> <span className="font-medium">{r.bullId}</span></div>
                  <div><span className="text-gray-500">Semen Breed:</span> <span className="font-medium">{r.semenBreed}</span></div>
                  <div><span className="text-gray-500">Batch No:</span> <span className="font-medium">{r.batchNo}</span></div>
                  <div><span className="text-gray-500">AI Date:</span> <span className="font-medium">{r.aiDate?.split('T')[0]}</span></div>
                  <div><span className="text-gray-500">PD Date:</span> <span className="font-medium">{r.pdDate?.split('T')[0]}</span></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Vaccination Section
function VaccinationSection() {
  const [vaccinations, setVaccinations] = useState([]);
  const [cattle, setCattle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ cattle: '', farmer: '', vaccineName: '', scheduledDate: '', notes: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [vacRes, cattleRes] = await Promise.all([
        API.get('/ldo/vaccinations'),
        API.get('/ldo/cattle')
      ]);
      setVaccinations(vacRes.data);
      setCattle(cattleRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!form.cattle) return setFormError('Select cattle');
    if (!form.vaccineName.trim()) return setFormError('Enter vaccine name');
    if (!form.scheduledDate) return setFormError('Select scheduled date');
    try {
      const selectedCattle = cattle.find(c => c._id === form.cattle);
      await API.post('/ldo/vaccinations', { ...form, farmer: selectedCattle?.farmer?._id });
      setMessage('✅ Vaccination scheduled');
      setShowForm(false);
      setForm({ cattle: '', farmer: '', vaccineName: '', scheduledDate: '', notes: '' });
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch { setFormError('Error scheduling vaccination'); }
  };

  const markComplete = async (id) => {
    try {
      await API.put(`/ldo/vaccinations/${id}/complete`);
      setMessage('✅ Marked as completed');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  const upcoming = vaccinations.filter(v => v.status === 'scheduled');
  const completed = vaccinations.filter(v => v.status === 'completed');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700">📅 Vaccination Tracker</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          {showForm ? '✕ Cancel' : '+ Schedule Vaccination'}
        </button>
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{message}</div>}

      {showForm && (
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">📅 Schedule New Vaccination</h3>
          {formError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-3 text-sm">⚠️ {formError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cattle *</label>
              <select value={form.cattle} onChange={e => setForm({...form, cattle: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Select Cattle</option>
                {cattle.map(c => <option key={c._id} value={c._id}>{c.name} ({c.cattleId}) - {c.farmer?.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Name *</label>
              <input type="text" value={form.vaccineName} onChange={e => setForm({...form, vaccineName: e.target.value})}
                placeholder="e.g. FMD Vaccine"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
              <input type="date" value={form.scheduledDate} min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({...form, scheduledDate: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                placeholder="Additional notes..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">💾 Schedule</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition">Cancel</button>
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">📅 Upcoming ({upcoming.length})</h3>
        {upcoming.length === 0 ? <p className="text-gray-400 text-sm">No upcoming vaccinations</p> : (
          <div className="space-y-3">
            {upcoming.map(v => (
              <div key={v._id} className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-400 flex justify-between items-center">
                <div>
                  <p className="font-medium">{v.cattle?.name} <span className="text-gray-400 text-xs">({v.cattle?.cattleId})</span></p>
                  <p className="text-sm text-gray-600">{v.vaccineName}</p>
                  <p className="text-xs text-gray-400">{v.farmer?.fullName} • {v.scheduledDate?.split('T')[0]}</p>
                </div>
                <button onClick={() => markComplete(v._id)}
                  className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1 rounded-lg text-xs font-medium transition">
                  ✅ Complete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">✅ Completed ({completed.length})</h3>
        {completed.length === 0 ? <p className="text-gray-400 text-sm">No completed vaccinations</p> : (
          <div className="space-y-3">
            {completed.map(v => (
              <div key={v._id} className="bg-white rounded-xl shadow p-4 border-l-4 border-green-400 opacity-80">
                <p className="font-medium">{v.cattle?.name} <span className="text-gray-400 text-xs">({v.cattle?.cattleId})</span></p>
                <p className="text-sm text-gray-600">{v.vaccineName}</p>
                <p className="text-xs text-gray-400">{v.farmer?.fullName} • Completed: {v.completedDate?.split('T')[0]}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Advice Section
function AdviceSection() {
  const [farmers, setFarmers] = useState([]);
  const [cattle, setCattle] = useState([]);
  const [filteredCattle, setFilteredCattle] = useState([]);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ farmer: '', cattle: '', title: '', content: '', category: 'පෝෂණය' });

  useEffect(() => {
    Promise.all([API.get('/ldo/farmers'), API.get('/ldo/cattle')])
      .then(([fRes, cRes]) => { setFarmers(fRes.data); setCattle(cRes.data); })
      .catch(err => console.error(err));
  }, []);

  const handleFarmerChange = (farmerId) => {
    setForm({ ...form, farmer: farmerId, cattle: '' });
    setFilteredCattle(cattle.filter(c => c.farmer?._id === farmerId));
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!form.farmer) return setFormError('Select a farmer');
    if (!form.title.trim()) return setFormError('Enter title');
    if (!form.content.trim()) return setFormError('Enter content');
    try {
      await API.post('/ldo/advice', form);
      setMessage('✅ Advice sent successfully');
      setForm({ farmer: '', cattle: '', title: '', content: '', category: 'පෝෂණය' });
      setFilteredCattle([]);
      setTimeout(() => setMessage(''), 3000);
    } catch { setFormError('Error sending advice'); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-6">🌾 Nutrition Advice</h2>
      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{message}</div>}
      <div className="bg-white rounded-xl shadow p-6">
        {formError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">⚠️ {formError}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farmer *</label>
            <select value={form.farmer} onChange={e => handleFarmerChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Select Farmer</option>
              {farmers.map(f => <option key={f._id} value={f._id}>{f.fullName} ({f.phone})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cattle (Optional)</label>
            <select value={form.cattle} onChange={e => setForm({...form, cattle: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">All Cattle</option>
              {filteredCattle.map(c => <option key={c._id} value={c._id}>{c.name} ({c.cattleId})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="පෝෂණය">🌿 පෝෂණය</option>
              <option value="සෞඛ්‍යය">🏥 සෞඛ්‍යය</option>
              <option value="කිරි නිෂ්පාදනය">🥛 කිරි නිෂ්පාදනය</option>
              <option value="අනෙකුත්">📌 අනෙකුත්</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              placeholder="Advice title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})}
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

// History Section
function HistorySection() {
  const [cattle, setCattle] = useState([]);
  const [history, setHistory] = useState(null);
  const [activeTab, setActiveTab] = useState('health');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/ldo/cattle').then(res => setCattle(res.data)).catch(err => console.error(err));
  }, []);

  const fetchHistory = async (id) => {
    setLoading(true);
    try {
      const res = await API.get(`/ldo/cattle/${id}/history`);
      setHistory(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const tabs = [
    { id: 'health', label: '🌡️ Clinical History' },
    { id: 'ai', label: '💉 AI History' },
    { id: 'vaccinations', label: '📅 Vaccination History' },
    { id: 'milk', label: '🥛 Milk Trend' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-6">📜 Cattle Full History</h2>
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Cattle</label>
        <select onChange={e => fetchHistory(e.target.value)} defaultValue=""
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="" disabled>Select cattle to view history</option>
          {cattle.map(c => <option key={c._id} value={c._id}>{c.name} ({c.cattleId}) - {c.farmer?.fullName}</option>)}
        </select>
      </div>

      {loading && <div className="text-center py-10 text-gray-400">Loading history...</div>}

      {history && !loading && (
        <div>
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <p className="font-bold text-blue-700">{history.cattle?.name} ({history.cattle?.cattleId})</p>
            <p className="text-sm text-gray-600">Farmer: {history.cattle?.farmer?.fullName} • {history.cattle?.farmer?.phone}</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === t.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}>{t.label}</button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'health' && (
            <div className="space-y-3">
              {history.health?.length === 0 ? <p className="text-gray-400">No health records</p> :
                history.health?.map(h => (
                  <div key={h._id} className={`bg-white rounded-xl p-4 border-l-4 ${h.isAlert ? 'border-red-500' : 'border-green-400'}`}>
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{h.symptoms}</p>
                        <p className="text-sm text-gray-500">Temp: {h.temperature}°C • {h.date?.split('T')[0]}</p>
                        {h.notes && <p className="text-xs text-gray-400 mt-1">{h.notes}</p>}
                      </div>
                      {h.isAlert && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full h-fit">⚠️ Alert</span>}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-3">
              {history.ai?.length === 0 ? <p className="text-gray-400">No AI records</p> :
                history.ai?.map(a => (
                  <div key={a._id} className="bg-white rounded-xl p-4 border-l-4 border-blue-400">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">AI Request — {a.requestDate?.split('T')[0]}</p>
                        {a.breedPreference && <p className="text-sm text-gray-500">Breed: {a.breedPreference}</p>}
                        {a.bullId && <p className="text-sm text-gray-500">Bull: {a.bullId} • Batch: {a.batchNo}</p>}
                        {a.aiDate && <p className="text-sm text-gray-500">AI Date: {a.aiDate?.split('T')[0]} • PD: {a.pdDate?.split('T')[0]}</p>}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        a.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        a.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{a.status}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'vaccinations' && (
            <div className="space-y-3">
              {history.vaccinations?.length === 0 ? <p className="text-gray-400">No vaccination records</p> :
                history.vaccinations?.map(v => (
                  <div key={v._id} className={`bg-white rounded-xl p-4 border-l-4 ${v.status === 'completed' ? 'border-green-400' : 'border-yellow-400'}`}>
                    <p className="font-medium">{v.vaccineName}</p>
                    <p className="text-sm text-gray-500">Scheduled: {v.scheduledDate?.split('T')[0]}
                      {v.completedDate && ` • Completed: ${v.completedDate?.split('T')[0]}`}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {v.status}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'milk' && (
            <div className="space-y-3">
              {history.milk?.length === 0 ? <p className="text-gray-400">No milk records (last 7 days)</p> :
                history.milk?.map(m => (
                  <div key={m._id} className="bg-white rounded-xl p-4 border-l-4 border-green-400">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{m.date?.split('T')[0]}</p>
                        <p className="text-sm text-gray-500">Morning: {m.morningMilk}L • Evening: {m.eveningMilk}L</p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{m.totalMilk}L</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Milk Analytics Section
function MilkAnalyticsSection() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/ldo/milk-analytics')
      .then(res => setRecords(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Group by cattle
  const grouped = {};
  records.forEach(r => {
    const key = r.cattle?._id;
    if (!key) return;
    if (!grouped[key]) grouped[key] = { cattle: r.cattle, farmer: r.farmer, records: [], total: 0 };
    grouped[key].records.push(r);
    grouped[key].total += r.totalMilk || 0;
  });

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-6">🥛 Milk Analytics (Last 7 Days)</h2>
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">🥛</div><p>No milk records in last 7 days</p></div>
      ) : (
        <div className="space-y-4">
          {Object.values(grouped).map(g => (
            <div key={g.cattle?._id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-bold text-gray-800">{g.cattle?.name} <span className="text-gray-400 text-sm">({g.cattle?.cattleId})</span></p>
                  <p className="text-xs text-gray-500">Farmer: {g.farmer?.fullName}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{g.total.toFixed(1)}L</p>
                  <p className="text-xs text-gray-400">7-day total</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50">
                    <th className="px-2 py-1 text-left">Date</th>
                    <th className="px-2 py-1 text-left">Morning</th>
                    <th className="px-2 py-1 text-left">Evening</th>
                    <th className="px-2 py-1 text-left">Total</th>
                  </tr></thead>
                  <tbody>
                    {g.records.map(r => (
                      <tr key={r._id} className="border-t">
                        <td className="px-2 py-1">{r.date?.split('T')[0]}</td>
                        <td className="px-2 py-1">{r.morningMilk}L</td>
                        <td className="px-2 py-1">{r.eveningMilk}L</td>
                        <td className="px-2 py-1 font-semibold text-green-600">{r.totalMilk}L</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}