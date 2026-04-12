import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import LDODashboard from './pages/LDODashboard';
import VetDashboard from './pages/VetDashboard';
import Landing from './pages/Landing';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'farmer') return <Navigate to="/farmer" replace />;
    if (user.role === 'ldo') return <Navigate to="/ldo" replace />;
    if (user.role === 'vet') return <Navigate to="/vet" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/farmer" element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>} />
      <Route path="/farmer/:section" element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>} />
      <Route path="/ldo" element={<ProtectedRoute role="ldo"><LDODashboard /></ProtectedRoute>} />
      <Route path="/ldo/:section" element={<ProtectedRoute role="ldo"><LDODashboard /></ProtectedRoute>} />
      <Route path="/vet" element={<ProtectedRoute role="vet"><VetDashboard /></ProtectedRoute>} />
      <Route path="/vet/:section" element={<ProtectedRoute role="vet"><VetDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;