import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';

import Signup     from './pages/Signup';
import VerifyOTP  from './pages/VerifyOTP';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Kitchen    from './pages/Kitchen';
import UserPanel  from './pages/UserPanel';
import POS        from './pages/POS';

const Unauthorized = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexDirection: 'column', gap: 16,
    background: '#f7f4f0',
  }}>
    <div style={{ fontSize: 64 }}>🚫</div>
    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1c1917' }}>Access Denied</h2>
    <p style={{ fontSize: 14, color: '#78716c' }}>You don't have permission to view this page.</p>
    <a href="/login" style={{
      marginTop: 8, padding: '11px 28px', borderRadius: 10,
      background: '#1c1917', color: '#fff', fontWeight: 600,
      textDecoration: 'none', fontSize: 14,
    }}>← Back to Login</a>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"            element={<Navigate to="/login" replace />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/signup"      element={<Signup />} />
          <Route path="/verify-otp"  element={<VerifyOTP />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin only */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Cashier only */}
          <Route path="/pos" element={
            <ProtectedRoute roles={['cashier']}>
              <POS />
            </ProtectedRoute>
          } />

          {/* Kitchen only */}
          <Route path="/kitchen" element={
            <ProtectedRoute roles={['kitchen']}>
              <Kitchen />
            </ProtectedRoute>
          } />

          {/* Customer panel */}
          <Route path="/user" element={
            <ProtectedRoute roles={['user']}>
              <UserPanel />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
