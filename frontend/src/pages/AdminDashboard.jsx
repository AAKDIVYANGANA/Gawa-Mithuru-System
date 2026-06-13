import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../utils/api';
import locations from '../data/locations';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { section } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSection = section || 'home';
  const handleLogout = () => { logout(); navigate('/login'); };
  const setActiveSection = (id) => {
    navigate(id === 'home' ? '/admin' : `/admin/${id}`);
    setSidebarOpen(false);
  };

  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Dashboard' },
    { id: 'ldos', icon: '👨‍💼', label: 'LDO Management' },
    { id: 'vets', icon: '👨‍⚕️', label: 'Vet Management' },
    { id: 'farmers', icon: '👨‍🌾', label: 'Farmer Directory' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between md:hidden sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          <div>
            <p className="font-bold text-sm">GawaMithuru Admin</p>
            <p className="text-gray-300 text-xs">{user?.fullName}</p>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white text-2xl">
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {sidebarOpen && (
        <div className="md:hidden bg-gray-900 text-white z-30 shadow-lg">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)}
              className={`w-full text-left px-6 py-3 flex items-center gap-3 border-b border-gray-700 ${
                activeSection === item.id ? 'bg-white text-gray-800 font-semibold' : 'hover:bg-gray-700'
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
        <div className="hidden md:flex w-64 bg-gray-800 text-white flex-col min-h-screen sticky top-0">
          <div className="p-6 border-b border-gray-700">
            <div className="text-3xl mb-1">⚙️</div>
            <h1 className="text-xl font-bold">GawaMithuru</h1>
            <p className="text-gray-300 text-sm">Admin Panel</p>
            <p className="text-gray-400 text-xs mt-1">{user?.fullName}</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${
                  activeSection === item.id ? 'bg-white text-gray-800 font-semibold' : 'hover:bg-gray-700'
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
          {activeSection === 'ldos' && <StaffSection role="ldo" title="LDO Management" icon="👨‍💼" color="blue" />}
          {activeSection === 'vets' && <StaffSection role="vet" title="Vet Management" icon="👨‍⚕️" color="purple" />}
          {activeSection === 'farmers' && <FarmersSection />}
        </div>
      </div>
    </div>
  );
}

function HomeSection({ setActiveSection }) {
  const [stats, setStats] = useState({ farmers: 0, ldos: 0, vets: 0 });

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await API.get('/admin/stats');
        if (isMounted) setStats(res.data);
      } catch (err) { console.error(err); }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-700 mb-6">⚙️ Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div onClick={() => setActiveSection('farmers')}
          className="bg-green-50 border border-green-200 rounded-xl p-6 cursor-pointer hover:opacity-80 transition">
          <div className="text-3xl mb-2">👨‍🌾</div>
          <div className="text-3xl font-bold text-green-700">{stats.farmers}</div>
          <div className="text-sm text-green-600 mt-1">Registered Farmers</div>
        </div>
        <div onClick={() => setActiveSection('ldos')}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 cursor-pointer hover:opacity-80 transition">
          <div className="text-3xl mb-2">👨‍💼</div>
          <div className="text-3xl font-bold text-blue-700">{stats.ldos}</div>
          <div className="text-sm text-blue-600 mt-1">LDO Officers</div>
        </div>
        <div onClick={() => setActiveSection('vets')}
          className="bg-purple-50 border border-purple-200 rounded-xl p-6 cursor-pointer hover:opacity-80 transition">
          <div className="text-3xl mb-2">👨‍⚕️</div>
          <div className="text-3xl font-bold text-purple-700">{stats.vets}</div>
          <div className="text-sm text-purple-600 mt-1">Veterinary Officers</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => setActiveSection('ldos')}
          className="bg-white border border-blue-200 rounded-xl p-5 text-left hover:bg-blue-50 transition shadow-sm">
          <div className="text-2xl mb-2">👨‍💼</div>
          <p className="font-semibold text-blue-700">LDO Register & Manage</p>
          <p className="text-xs text-gray-500 mt-1">Add new LDOs, assign DS divisions</p>
        </button>
        <button onClick={() => setActiveSection('vets')}
          className="bg-white border border-purple-200 rounded-xl p-5 text-left hover:bg-purple-50 transition shadow-sm">
          <div className="text-2xl mb-2">👨‍⚕️</div>
          <p className="font-semibold text-purple-700">Vet Register & Manage</p>
          <p className="text-xs text-gray-500 mt-1">Add new Vets, assign DS divisions</p>
        </button>
      </div>
    </div>
  );
}

function StaffSection({ role, title, icon, color }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', district: '', assignedDsDivisions: []
  });
  const [selectedDivisions, setSelectedDivisions] = useState([]);

  const districts = Object.keys(locations);
  const dsDivisions = form.district ? locations[form.district] : [];

  const colorMap = {
    blue: { bg: 'bg-blue-600', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', ring: 'focus:ring-blue-400' },
    purple: { bg: 'bg-purple-600', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', ring: 'focus:ring-purple-400' },
  };
  const c = colorMap[color];

  const fetchStaff = useCallback(async () => {
    try {
      const res = await API.get(`/admin/${role}s`);
      setStaff(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [role]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const toggleDivision = (div) => {
    setSelectedDivisions(prev =>
      prev.includes(div) ? prev.filter(d => d !== div) : [...prev, div]
    );
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!editId && !form.fullName.trim()) return setFormError('Name required');
    if (!editId && !form.email.trim()) return setFormError('Email required');
    if (!editId && !form.password.trim()) return setFormError('Password required');
    if (!form.district) return setFormError('District required');
    if (selectedDivisions.length === 0) return setFormError('Select at least one DS Division');
    try {
      if (editId) {
        await API.put(`/admin/users/${editId}/assignment`, {
          district: form.district,
          assignedDsDivisions: selectedDivisions,
          phone: form.phone || undefined
        });
        setMessage('✅ Assignment updated');
      } else {
        await API.post(`/admin/${role}`, {
          ...form,
          assignedDsDivisions: selectedDivisions
        });
        setMessage(`✅ ${role.toUpperCase()} registered successfully`);
      }
      setShowForm(false);
      setEditId(null);
      setForm({ fullName: '', email: '', password: '', phone: '', district: '', assignedDsDivisions: [] });
      setSelectedDivisions([]);
      fetchStaff();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred');
    }
  };

  const handleEdit = (s) => {
    setEditId(s._id);
    setForm({
      fullName: s.fullName,
      email: s.email,
      password: '',
      phone: s.phone || '',
      district: s.district || '',
      assignedDsDivisions: s.assignedDsDivisions || []
    });
    setSelectedDivisions(s.assignedDsDivisions || []);
    setShowForm(true);
    setFormError('');
  };

  const handleToggle = async (id) => {
    try {
      await API.put(`/admin/users/${id}/toggle`);
      fetchStaff();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      fetchStaff();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${c.text}`}>{icon} {title}</h2>
        <button onClick={() => {
          setShowForm(!showForm); setEditId(null); setFormError('');
          setForm({ fullName: '', email: '', password: '', phone: '', district: '', assignedDsDivisions: [] });
          setSelectedDivisions([]);
        }}
          className={`${c.bg} hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition`}>
          {showForm ? '✕ Cancel' : `+ Register ${role.toUpperCase()}`}
        </button>
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{message}</div>}

      {showForm && (
        <div className={`bg-white rounded-xl shadow p-5 mb-6 border ${c.border}`}>
          <h3 className={`font-semibold ${c.text} mb-4`}>
            {editId ? '✏️ Update Details' : `➕ Register New ${role.toUpperCase()}`}
          </h3>
          {formError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">⚠️ {formError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {!editId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Dr. / Mr. Full Name"
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none ${c.ring} focus:ring-2`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none ${c.ring} focus:ring-2`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input type="password" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none ${c.ring} focus:ring-2`} />
                </div>
              </>
            )}

            {/* Phone - show always */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number {editId ? '' : '(Optional)'}
              </label>
              <input type="tel" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="07XXXXXXXX"
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none ${c.ring} focus:ring-2`} />
              <p className="text-xs text-gray-400 mt-1">ගොවීන්ට දුරකථන ඇමතුම් සඳහා</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
              <select value={form.district}
                onChange={e => { setForm({ ...form, district: e.target.value }); setSelectedDivisions([]); }}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none ${c.ring} focus:ring-2`}>
                <option value="">Select District</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {form.district && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DS Divisions * <span className="text-gray-400 text-xs">({selectedDivisions.length} selected)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {dsDivisions.map(div => (
                  <label key={div} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition ${
                    selectedDivisions.includes(div) ? `${c.light} ${c.text} font-medium` : 'hover:bg-gray-50'
                  }`}>
                    <input type="checkbox" checked={selectedDivisions.includes(div)}
                      onChange={() => toggleDivision(div)} className="rounded" />
                    {div}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleSubmit}
              className={`${c.bg} hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition`}>
              💾 {editId ? 'Update' : 'Register'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {staff.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">{icon}</div>
          <p>No {role.toUpperCase()}s registered yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {staff.map(s => (
            <div key={s._id} className={`bg-white rounded-xl shadow p-4 border-l-4 ${
              s.isActive !== false ? (color === 'blue' ? 'border-blue-400' : 'border-purple-400') : 'border-gray-300'
            }`}>
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">{icon} {s.fullName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.isActive !== false ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>{s.isActive !== false ? '✅ Active' : '❌ Inactive'}</span>
                  </div>
                  <p className="text-sm text-gray-500">📧 {s.email}</p>
                  {s.phone && <p className="text-sm text-gray-500">📞 {s.phone}</p>}
                  {s.district && <p className="text-sm text-gray-500">📍 {s.district}</p>}
                  {s.assignedDsDivisions?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {s.assignedDsDivisions.map(div => (
                        <span key={div} className={`text-xs px-2 py-0.5 rounded-full ${c.light} ${c.text}`}>{div}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => handleEdit(s)}
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-3 py-1 rounded-lg text-xs font-medium transition">
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleToggle(s._id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      s.isActive !== false
                        ? 'bg-red-50 hover:bg-red-100 text-red-600'
                        : 'bg-green-50 hover:bg-green-100 text-green-600'
                    }`}>
                    {s.isActive !== false ? '🚫 Deactivate' : '✅ Activate'}
                  </button>
                  <button onClick={() => handleDelete(s._id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-medium transition">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FarmersSection() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/admin/farmers')
      .then(res => setFarmers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = farmers.filter(f =>
    f.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    f.phone?.includes(search) ||
    f.district?.toLowerCase().includes(search.toLowerCase()) ||
    f.dsDivision?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-700 mb-4">👨‍🌾 Farmer Directory</h2>
      <input type="text" placeholder="Search by name, phone, district or DS division..."
        value={search} onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400" />
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">District</th>
              <th className="px-4 py-3 text-left">DS Division</th>
              <th className="px-4 py-3 text-left">Registered</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No farmers found</td></tr>
            ) : filtered.map((f, i) => (
              <tr key={f._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 font-medium">{f.fullName}</td>
                <td className="px-4 py-3">{f.phone}</td>
                <td className="px-4 py-3">{f.district || '-'}</td>
                <td className="px-4 py-3">{f.dsDivision || '-'}</td>
                <td className="px-4 py-3 text-gray-400">{f.createdAt?.split('T')[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}