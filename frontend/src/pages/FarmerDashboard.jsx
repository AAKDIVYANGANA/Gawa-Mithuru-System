import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../utils/api';
import CattleSection from '../components/farmer/CattleSection';
import MilkInput from '../components/farmer/MilkInput';
import HealthReport from '../components/farmer/HealthReport';
import AIRequest from '../components/farmer/AIRequest';
import AdviceFeed from '../components/farmer/AdviceFeed';
import MilkChart from '../components/farmer/MilkChart';
import VaccinationFeed from '../components/farmer/VaccinationFeed';
import ProfileSection from '../components/farmer/ProfileSection';
import CattleTransfer from '../components/farmer/CattleTransfer';

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { section } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSection = section || 'home';
  const handleLogout = () => { logout(); navigate('/login'); };
  const setActiveSection = (id) => {
    navigate(id === 'home' ? '/farmer' : `/farmer/${id}`);
    setSidebarOpen(false);
  };

  const menuItems = [
    { id: 'home', icon: '🏠', label: 'මුල් පිටුව' },
    { id: 'cattle', icon: '🐄', label: 'ගව විස්තර' },
    { id: 'milk', icon: '🍶', label: 'දෛනික කිරි' },
    { id: 'milkchart', icon: '📊', label: 'කිරි ප්‍රස්ථාර' },
    { id: 'health', icon: '🌡️', label: 'සෞඛ්‍ය වාර්තා' },
    { id: 'ai', icon: '🧬', label: 'සිංචන ඉල්ලීම' },
    { id: 'vaccination', icon: '📅', label: 'එන්නත් කාලසටහන' },
    { id: 'transfer', icon: '🔄', label: 'ගව හිමිකාරිත්ව මාරුව' },
    { id: 'advice', icon: '📋', label: 'ලැබුණු උපදෙස්' },
    { id: 'profile', icon: '👤', label: 'පැතිකඩ' },
  ];

  return (
    <div className="min-h-screen bg-green-50">

      {/* Mobile Header */}
      <div className="bg-green-700 text-white px-4 py-3 flex items-center justify-between md:hidden sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐄</span>
          <div>
            <p className="font-bold text-sm">ගව මිතුරු</p>
            <p className="text-green-200 text-xs">{user?.fullName}</p>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white text-2xl focus:outline-none">
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {sidebarOpen && (
        <div className="md:hidden bg-green-800 text-white z-30 shadow-lg">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveSection(item.id)}
              className={`w-full text-left px-6 py-3 flex items-center gap-3 border-b border-green-700 ${
                activeSection === item.id ? 'bg-white text-green-700 font-semibold' : 'hover:bg-green-700'
              }`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
          <button onClick={handleLogout}
            className="w-full text-left px-6 py-3 flex items-center gap-3 bg-red-600 hover:bg-red-700">
            <span>🚪</span><span>ඉවත් වීම</span>
          </button>
        </div>
      )}

      <div className="flex">
        {/* Sidebar Desktop */}
        <div className="hidden md:flex w-64 bg-green-700 text-white flex-col min-h-screen sticky top-0">
          <div className="p-6 border-b border-green-600">
            <div className="text-3xl mb-1">🐄</div>
            <h1 className="text-xl font-bold">ගව මිතුරු</h1>
            <p className="text-green-200 text-sm mt-1">👨‍🌾 {user?.fullName}</p>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition duration-200 ${
                  activeSection === item.id ? 'bg-white text-green-700 font-semibold' : 'hover:bg-green-600 text-white'
                }`}>
                <span>{item.icon}</span><span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4">
            <button onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition duration-200">
              🚪 ඉවත් වීම
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeSection === 'home' && <HomeSection user={user} setActiveSection={setActiveSection} />}
          {activeSection === 'cattle' && <CattleSection />}
          {activeSection === 'milk' && <MilkInput />}
          {activeSection === 'milkchart' && <MilkChart />}
          {activeSection === 'health' && <HealthReport />}
          {activeSection === 'ai' && <AIRequest />}
          {activeSection === 'vaccination' && <VaccinationFeed />}
          {activeSection === 'transfer' && <CattleTransfer />}
          {activeSection === 'advice' && <AdviceFeed />}
          {activeSection === 'profile' && <ProfileSection />}
        </div>
      </div>
    </div>
  );
}

function HomeSection({ user, setActiveSection }) {
  const [stats, setStats] = useState({ totalCattle: 0, sickCattle: 0, todayMilk: 0, upcomingVac: 0 });

  const fetchStats = async () => {
    try {
      const [cattleRes, milkRes, vacRes] = await Promise.all([
        API.get('/cattle'),
        API.get('/milk'),
        API.get('/vaccinations')
      ]);
      const today = new Date().toISOString().split('T')[0];
      const todayMilk = milkRes.data
        .filter(r => r.date?.split('T')[0] === today)
        .reduce((sum, r) => sum + (r.totalMilk || 0), 0);
      const sickCattle = cattleRes.data.filter(c => c.status === 'අසනීප').length;
      const upcomingVac = vacRes.data.filter(v => v.status === 'scheduled').length;
      setStats({
        totalCattle: cattleRes.data.length,
        sickCattle,
        todayMilk: todayMilk.toFixed(1),
        upcomingVac
      });
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchStats();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-green-700 mb-4 md:mb-6">
        සාදරයෙන් පිළිගනිමු, {user?.fullName}! 👋
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <SummaryCard icon="🐄" label="මුළු සතුන්" value={stats.totalCattle}
          color="bg-blue-100 text-blue-700" onClick={() => setActiveSection('cattle')} />
        <SummaryCard icon="🤒" label="අසනීප සතුන්" value={stats.sickCattle}
          color="bg-red-100 text-red-700" onClick={() => setActiveSection('health')} />
        <SummaryCard icon="🍶" label="අද කිරි (L)" value={stats.todayMilk}
          color="bg-yellow-100 text-yellow-700" onClick={() => setActiveSection('milk')} />
        <SummaryCard icon="📅" label="ඉදිරි එන්නත්" value={stats.upcomingVac}
          color="bg-purple-100 text-purple-700" onClick={() => setActiveSection('vaccination')} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-3">⚡ ඉක්මන් ක්‍රියා</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction icon="🐄" label="ගව එකතු කරන්න" onClick={() => setActiveSection('cattle')} />
          <QuickAction icon="🍶" label="කිරි ඇතුළත් කරන්න" onClick={() => setActiveSection('milk')} />
          <QuickAction icon="🌡️" label="සෞඛ්‍ය වාර්තා" onClick={() => setActiveSection('health')} />
          <QuickAction icon="🧬" label="සිංචන ඉල්ලීම" onClick={() => setActiveSection('ai')} />
          <QuickAction icon="📅" label="එන්නත් කාලසටහන" onClick={() => setActiveSection('vaccination')} />
          <QuickAction icon="📊" label="කිරි ප්‍රස්ථාර" onClick={() => setActiveSection('milkchart')} />
          <QuickAction icon="🔄" label="ගව Transfer" onClick={() => setActiveSection('transfer')} />
          <QuickAction icon="📋" label="ලැබුණු උපදෙස්" onClick={() => setActiveSection('advice')} />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color, onClick }) {
  return (
    <div onClick={onClick} className={`${color} rounded-xl p-4 md:p-6 cursor-pointer hover:opacity-80 transition`}>
      <div className="text-2xl md:text-3xl mb-1 md:mb-2">{icon}</div>
      <div className="text-xl md:text-2xl font-bold">{value}</div>
      <div className="text-xs md:text-sm mt-1">{label}</div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-3 md:p-4 text-center transition">
      <div className="text-xl md:text-2xl mb-1">{icon}</div>
      <div className="text-xs text-green-700 font-medium">{label}</div>
    </button>
  );
}