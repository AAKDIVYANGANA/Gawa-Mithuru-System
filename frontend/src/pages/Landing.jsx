import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col" style={{
      minHeight: '100%',
      backgroundImage: `linear-gradient(rgba(0,80,0,0.75), rgba(0,50,0,0.88)), url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1400&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'scroll'
    }}>

      {/* Hero */}
      <div className="text-center px-6 py-16 text-white flex flex-col items-center justify-center">
    
        <h1 className="text-4xl md:text-6xl font-bold mb-4">ගව මිතුරු</h1>
        <p className="text-green-200 text-lg md:text-xl mb-2">
          පශු සම්පත් කළමනාකරණ පද්ධතිය
        </p>
        <p className="text-green-300 text-sm md:text-base mb-10 max-w-md mx-auto">
          ශ්‍රී ලාංකේය ගොවීන් සඳහා නිර්මිත ස්මාර්ට් ගව කළමනාකරණ මෙවලමකි
        </p>
        <button onClick={() => navigate('/login')}
          className="bg-gradient-to-r from-green-500 to-green-700 text-white font-bold px-12 py-4 rounded-full text-xl hover:from-green-600 hover:to-green-800 transition duration-300 shadow-xl transform hover:-translate-y-1 hover:scale-105">
          ආරම්භ කරන්න
        </button>
      </div>

      {/* Features */}
      <div className="px-6 pb-10">
        <h2 className="text-center text-xl font-bold mb-6 text-green-100">✨ ප්‍රධාන පහසුකම්</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
          <FeatureCard icon="🐄" title="ගව තොරතුරු" desc="සියලු ගවයන්ගේ විස්තර" />
          <FeatureCard icon="🍶" title="කිරි වාර්තා" desc="දෛනික කිරි අස්වැන්න සටහන් කිරීම" />
          <FeatureCard icon="📊" title="දත්ත විශ්ලේෂණය" desc="නිෂ්පාදන වර්ධනය නිරීක්ෂණය" />
          <FeatureCard icon="🌡️" title="සෞඛ්‍ය කළමනාකරණය" desc="අසනීප සහ ප්‍රතිකාර ඉතිහාසය" />
          <FeatureCard icon="💉" title="කෘතිම සිංචනය" desc="නිලධාරීන්ගෙන් සිංචන සේවා" />
          <FeatureCard icon="📱" title="Mobile සහාය" desc="ජංගම දුරකථනයෙන් පහසුවෙන්" />
        </div>
      </div>

      {/* Roles */}
      <div className="px-6 py-8" style={{ backgroundColor: 'rgba(41, 38, 38, 0.35)' }}>
        <h2 className="text-center text-xl font-bold mb-6 text-green-100">👥 පරිශීලක භූමිකාවන්</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <RoleCard icon="👨‍🌾" title="ගොවියා" desc="ගව දත්ත කළමනාකරණය සහ දෛනික කිරි අස්වැන්න ඇතුළත් කිරීම" color="bg-green-600" />
          <RoleCard icon="👨‍💼" title="LDO නිලධාරී" desc="ගොවිපළ නිරීක්ෂණය සහ සිංචන (AI) ඉල්ලීම් අනුමත කිරීම" color="bg-blue-600" />
          <RoleCard icon="👨‍⚕️" title="පශු වෛද්‍ය" desc="සත්ව සෞඛ්‍ය පරීක්ෂාව සහ ප්‍රතිකාර නිර්දේශ ලබා දීම" color="bg-purple-600" />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center px-4 py-8 text-green-400 text-sm"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <p className="font-semibold mb-1">© 2026 ගව මිතුරු | ශ්‍රී ලංකා</p>
      </div>

    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="rounded-xl p-4 text-center text-white border border-green-500"
      style={{ backgroundColor: 'rgba(0,100,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-green-300 text-xs">{desc}</p>
    </div>
  );
}

function RoleCard({ icon, title, desc, color }) {
  return (
    <div className={`${color} bg-opacity-80 rounded-xl p-5 text-center text-white`}>
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-white text-xs opacity-90">{desc}</p>
    </div>
  );
}