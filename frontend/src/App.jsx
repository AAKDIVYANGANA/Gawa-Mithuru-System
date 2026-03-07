import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import LDODashboard from './pages/LDODashboard';
import VetDashboard from './pages/VetDashboard';
import Landing from './pages/Landing';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/farmer" element={
        <ProtectedRoute role="farmer">
          <FarmerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/ldo" element={
        <ProtectedRoute role="ldo">
          <LDODashboard />
        </ProtectedRoute>
      } />
      <Route path="/vet" element={
        <ProtectedRoute role="vet">
          <VetDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;