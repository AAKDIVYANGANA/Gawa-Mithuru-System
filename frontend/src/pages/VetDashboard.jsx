import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../utils/api';

export default function VetDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { section } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSection = section || 'home';
  const handleLogout = () => { logout(); navigate('/login'); };
  const setActiveSection = (id) => {
    navigate(id === 'home' ? '/vet' : `/vet/${id}`);
    setSidebarOpen(false);
  };

  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Dashboard Home' },
    { id: 'alerts', icon: '⚠️', label: 'Health Alerts' },
    { id: 'reports', icon: '🌡️', label: 'All Health Reports' },
    { id: 'prescriptions', icon: '💊', label: 'Prescriptions' },
    { id: 'cattle', icon: '🐄', label: 'Cattle Directory' },
  ];

  return (
    <div className="min-h-screen bg-purple-50">
      <div className="bg-purple-700 text-white px-4 py-3 flex items-center justify-between md:hidden sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👨‍⚕️</span>
          <div>
            <p className="font-bold text-sm">GawaMithuru - Vet</p>
            <p className="text-purple-200 text-xs">{user?.fullName}</p>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white text-2xl">
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {sidebarOpen && (
        <div className="md:hidden bg-purple-800 text-white z-30 shadow-lg">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveSection(item.id)}
              className={`w-full text-left px-6 py-3 flex items-center gap-3 border-b border-purple-700 ${
                activeSection === item.id ? 'bg-white text-purple-700 font-semibold' : 'hover:bg-purple-700'
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
        <div className="hidden md:flex w-64 bg-purple-700 text-white flex-col min-h-screen sticky top-0">
          <div className="p-6 border-b border-purple-600">
            <div className="text-3xl mb-1">👨‍⚕️</div>
            <h1 className="text-xl font-bold">GawaMithuru</h1>
            <p className="text-purple-200 text-sm">Veterinary Dashboard</p>
            <p className="text-purple-300 text-xs mt-1">{user?.fullName}</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${
                  activeSection === item.id ? 'bg-white text-purple-700 font-semibold' : 'hover:bg-purple-600'
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

        <div className="flex-1 p-4 md:p-8">
          {activeSection === 'home' && <HomeSection setActiveSection={setActiveSection} />}
          {activeSection === 'alerts' && <AlertsSection />}
          {activeSection === 'reports' && <ReportsSection />}
          {activeSection === 'prescriptions' && <PrescriptionsSection />}
          {activeSection === 'cattle' && <CattleSection />}
        </div>
      </div>
    </div>
  );
}

function HomeSection({ setActiveSection }) {
  const [stats, setStats] = useState({ totalAlerts: 0, pendingReviews: 0, totalCattle: 0, totalPrescriptions: 0 });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [statsRes, notifRes] = await Promise.all([
          API.get('/vet/stats'),
          API.get('/notifications')
        ]);
        if (isMounted) {
          setStats(statsRes.data);
          setNotifications(notifRes.data.filter(n => n.type === 'health_alert'));
        }
      } catch (err) { console.error(err); }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-purple-700 mb-6">🏥 Veterinary Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon="⚠️" label="Total Alerts" value={stats.totalAlerts} color="bg-red-100 text-red-700" onClick={() => setActiveSection('alerts')} />
        <StatCard icon="🔍" label="Pending Reviews" value={stats.pendingReviews} color="bg-orange-100 text-orange-700" onClick={() => setActiveSection('alerts')} />
        <StatCard icon="🐄" label="Total Cattle" value={stats.totalCattle} color="bg-green-100 text-green-700" onClick={() => setActiveSection('cattle')} />
        <StatCard icon="💊" label="Prescriptions" value={stats.totalPrescriptions} color="bg-purple-100 text-purple-700" onClick={() => setActiveSection('prescriptions')} />
      </div>

      {/* Emergency Health Alert Notifications */}
      {notifications.length > 0 && (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-red-700 text-lg">🚨 Emergency Health Alerts</h3>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {notifications.filter(n => !n.isRead).length} New
            </span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.map(n => (
              <div key={n._id} className={`bg-white rounded-lg p-3 border-l-4 border-red-500 flex justify-between items-start ${!n.isRead ? 'shadow-sm' : 'opacity-60'}`}>
                <div className="flex-1">
                  <p className="font-semibold text-red-700 text-sm">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">🕐 {new Date(n.createdAt).toLocaleString('si-LK')}</p>
                </div>
                <div className="flex flex-col gap-1 items-end ml-2">
                  {!n.isRead && (
                    <button onClick={() => markRead(n._id)}
                      className="bg-white hover:bg-gray-50 text-gray-600 px-2 py-0.5 rounded text-xs border transition">
                      ✓ Read
                    </button>
                  )}
                  <button onClick={() => setActiveSection('alerts')}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-xs transition whitespace-nowrap">
                    View Alert
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveSection('alerts')}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition">
            ⚠️ View all Health Alerts 
          </button>
        </div>
      )}

      {/* No alerts message */}
      {notifications.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-green-600 text-sm font-medium">✅ No emergency health alerts</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: '⚠️', label: 'Health Alerts', id: 'alerts' },
          { icon: '🌡️', label: 'Health Reports', id: 'reports' },
          { icon: '💊', label: 'Prescriptions', id: 'prescriptions' },
          { icon: '🐄', label: 'Cattle Directory', id: 'cattle' },
        ].map(q => (
          <button key={q.id} onClick={() => setActiveSection(q.id)}
            className="bg-white rounded-xl p-4 text-center shadow hover:bg-purple-50 transition border border-purple-100">
            <div className="text-2xl mb-1">{q.icon}</div>
            <div className="text-xs text-purple-700 font-medium">{q.label}</div>
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

function AlertsSection() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchAlerts = async () => {
    try {
      const res = await API.get('/vet/health-alerts');
      setAlerts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const markReviewed = async (id) => {
    try {
      await API.put(`/vet/health-reports/${id}/review`);
      setMessage('✅ Marked as reviewed');
      fetchAlerts();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { console.error(err); }
  };

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-purple-700 mb-6">⚠️ Health Alerts</h2>
      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{message}</div>}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{alerts.filter(a => a.status === 'pending').length}</p>
          <p className="text-xs text-red-500">Pending Review</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{alerts.filter(a => a.status === 'reviewed').length}</p>
          <p className="text-xs text-green-500">Reviewed</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: '🔴 Pending' },
          { key: 'reviewed', label: '✅ Reviewed' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === f.key ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">✅</div><p>No health alerts</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(a => (
            <div key={a._id} className={`bg-white rounded-xl shadow p-4 border-l-4 ${
              a.status === 'pending' ? 'border-red-500' : 'border-green-400'
            }`}>
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-gray-800">{a.cattle?.name}</span>
                    <span className="text-gray-400 text-xs">({a.cattle?.cattleId})</span>
                    <span className="text-xs text-gray-500">{a.date?.split('T')[0]}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      a.status === 'pending' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {a.status === 'pending' ? '🔴 Pending' : '✅ Reviewed'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">Temperature</span>
                      <p className={`font-bold ${parseFloat(a.temperature) > 39.5 ? 'text-red-600' : 'text-green-600'}`}>
                        {a.temperature}°C
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Symptoms</span>
                      <p className="text-gray-700">{a.symptoms}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Farmer</span>
                      <p className="text-gray-700">{a.farmer?.fullName}</p>
                      <p className="text-gray-400 text-xs">{a.farmer?.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Breed</span>
                      <p className="text-gray-700">{a.cattle?.breed}</p>
                    </div>
                  </div>
                  {a.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded p-2">📝 {a.notes}</p>}
                </div>
                {a.status === 'pending' && (
                  <button onClick={() => markReviewed(a._id)}
                    className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap">
                    ✅ Mark Reviewed
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

function ReportsSection() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/vet/health-reports')
      .then(res => setReports(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter(r =>
    r.cattle?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.farmer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.symptoms?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-purple-700 mb-4">🌡️ All Health Reports</h2>
      <input type="text" placeholder="Search by cattle, farmer or symptoms..."
        value={search} onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400" />
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">🌡️</div><p>No health reports</p></div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Cattle</th>
                <th className="px-4 py-3 text-left">Farmer</th>
                <th className="px-4 py-3 text-left">Temp (°C)</th>
                <th className="px-4 py-3 text-left">Symptoms</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r._id} className={i % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                  <td className="px-4 py-3">{r.date?.split('T')[0]}</td>
                  <td className="px-4 py-3 font-medium">{r.cattle?.name} <span className="text-gray-400 text-xs">({r.cattle?.cattleId})</span></td>
                  <td className="px-4 py-3">{r.farmer?.fullName}<br /><span className="text-xs text-gray-400">{r.farmer?.phone}</span></td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${parseFloat(r.temperature) > 39.5 ? 'text-red-600' : 'text-green-600'}`}>
                      {r.temperature}
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.symptoms}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.isAlert ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {r.isAlert ? '⚠️ Alert' : '✅ Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PrescriptionsSection() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [cattle, setCattle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    cattle: '', farmer: '', diagnosis: '', medication: '', dosage: '', duration: '', notes: ''
  });

  const fetchData = async () => {
    try {
      const [presRes, cattleRes] = await Promise.all([
        API.get('/vet/prescriptions'),
        API.get('/vet/cattle')
      ]);
      setPrescriptions(presRes.data);
      setCattle(cattleRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    setFormError('');
    if (!form.cattle) return setFormError('Select cattle');
    if (!form.diagnosis.trim()) return setFormError('Enter diagnosis');
    if (!form.medication.trim()) return setFormError('Enter medication');
    if (!form.dosage.trim()) return setFormError('Enter dosage');
    if (!form.duration.trim()) return setFormError('Enter duration');
    try {
      const selectedCattle = cattle.find(c => c._id === form.cattle);
      await API.post('/vet/prescriptions', { ...form, farmer: selectedCattle?.farmer?._id });
      setMessage('✅ Prescription added successfully');
      setShowForm(false);
      setForm({ cattle: '', farmer: '', diagnosis: '', medication: '', dosage: '', duration: '', notes: '' });
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch { setFormError('Error adding prescription'); }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-700">💊 Prescriptions</h2>
        <button onClick={() => { setShowForm(!showForm); setFormError(''); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          {showForm ? '✕ Cancel' : '+ New Prescription'}
        </button>
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{message}</div>}

      {showForm && (
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">💊 New Prescription</h3>
          {formError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">⚠️ {formError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cattle *</label>
              <select value={form.cattle} onChange={e => setForm({ ...form, cattle: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="">Select Cattle</option>
                {cattle.map(c => <option key={c._id} value={c._id}>{c.name} ({c.cattleId}) - {c.farmer?.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
              <input type="text" value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                placeholder="e.g. Mastitis"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medication *</label>
              <input type="text" value={form.medication} onChange={e => setForm({ ...form, medication: e.target.value })}
                placeholder="e.g. Penicillin"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosage *</label>
              <input type="text" value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })}
                placeholder="e.g. 10ml twice daily"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
              <input type="text" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 5 days"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition">
              💾 Save Prescription
            </button>
            <button onClick={() => setShowForm(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {prescriptions.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">💊</div><p>No prescriptions yet</p></div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(p => (
            <div key={p._id} className="bg-white rounded-xl shadow p-4 border-l-4 border-purple-400">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-gray-800">🐄 {p.cattle?.name}</span>
                    <span className="text-gray-400 text-xs">({p.cattle?.cattleId})</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>{p.status}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><span className="text-gray-500 text-xs">Farmer</span><p className="text-gray-700">{p.farmer?.fullName}</p></div>
                    <div><span className="text-gray-500 text-xs">Diagnosis</span><p className="text-gray-700 font-medium">{p.diagnosis}</p></div>
                    <div><span className="text-gray-500 text-xs">Medication</span><p className="text-gray-700">{p.medication}</p></div>
                    <div><span className="text-gray-500 text-xs">Dosage</span><p className="text-gray-700">{p.dosage}</p></div>
                    <div><span className="text-gray-500 text-xs">Duration</span><p className="text-gray-700">{p.duration}</p></div>
                    <div><span className="text-gray-500 text-xs">Date</span><p className="text-gray-700">{p.createdAt?.split('T')[0]}</p></div>
                  </div>
                  {p.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded p-2">📝 {p.notes}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CattleSection() {
  const [cattle, setCattle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    API.get('/vet/cattle')
      .then(res => setCattle(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const fetchHistory = async (id) => {
    setHistoryLoading(true);
    try {
      const res = await API.get(`/vet/cattle/${id}/history`);
      setHistory(res.data);
    } catch (err) { console.error(err); }
    finally { setHistoryLoading(false); }
  };

  const filtered = cattle.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.farmer?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.cattleId?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-purple-700 mb-4">🐄 Cattle Directory</h2>
      <input type="text" placeholder="Search by cattle name, tag or farmer..."
        value={search} onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400" />
      <div className="bg-white rounded-xl shadow overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Farmer</th>
              <th className="px-4 py-3 text-left">Cattle</th>
              <th className="px-4 py-3 text-left">Breed</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No cattle found</td></tr>
            ) : filtered.map((c, i) => (
              <tr key={c._id} className={i % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                <td className="px-4 py-3">{c.farmer?.fullName}<br /><span className="text-xs text-gray-400">{c.farmer?.phone}</span></td>
                <td className="px-4 py-3 font-medium">{c.name} <span className="text-gray-400 text-xs">({c.cattleId})</span></td>
                <td className="px-4 py-3">{c.breed}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.status === 'සෞඛ්‍යසම්පන්න' ? 'bg-green-100 text-green-700' :
                    c.status === 'අසනීප' ? 'bg-red-100 text-red-700' :
                    c.status === 'ගර්භනී' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{c.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => fetchHistory(c._id)}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-xs font-medium transition">
                    📋 History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {historyLoading && <div className="text-center py-6 text-gray-400">Loading history...</div>}
      {history && !historyLoading && (
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold text-purple-700 mb-2">
            📋 Clinical History — {history.cattle?.name} ({history.cattle?.cattleId})
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Farmer: {history.cattle?.farmer?.fullName} • {history.cattle?.farmer?.phone}
          </p>
          {history.health?.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No health records</p>
          ) : (
            <div className="space-y-3">
              {history.health.map(h => (
                <div key={h._id} className={`rounded-xl p-4 border-l-4 ${h.isAlert ? 'border-red-500 bg-red-50' : 'border-green-400 bg-green-50'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{h.symptoms}</p>
                      <p className="text-sm text-gray-500">🌡️ {h.temperature}°C • 📅 {h.date?.split('T')[0]}</p>
                      {h.notes && <p className="text-xs text-gray-400 mt-1">📝 {h.notes}</p>}
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {h.isAlert && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">⚠️ Alert</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        h.status === 'reviewed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>{h.status}</span>
                    </div>
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