import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppShell from './layouts/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Policies from './pages/Policies';
import Claims from './pages/Claims';
import Payments from './pages/Payments';
import MyPolicies from './pages/MyPolicies';
import MyClaims from './pages/MyClaims';
import MyPayments from './pages/MyPayments';
import MyDocuments from './pages/MyDocuments';

function Protected({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

function RoleShell({ role, children }) {
  return <AppShell role={role}>{children}</AppShell>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} />

      {/* Admin */}
      <Route path="/admin" element={<Protected roles={['admin']}><RoleShell role="admin"><Dashboard /></RoleShell></Protected>} />
      <Route path="/admin/customers" element={<Protected roles={['admin']}><RoleShell role="admin"><Customers /></RoleShell></Protected>} />
      <Route path="/admin/policies" element={<Protected roles={['admin']}><RoleShell role="admin"><Policies /></RoleShell></Protected>} />
      <Route path="/admin/claims" element={<Protected roles={['admin']}><RoleShell role="admin"><Claims /></RoleShell></Protected>} />
      <Route path="/admin/payments" element={<Protected roles={['admin']}><RoleShell role="admin"><Payments /></RoleShell></Protected>} />

      {/* Agent */}
      <Route path="/agent" element={<Protected roles={['agent']}><RoleShell role="agent"><Dashboard /></RoleShell></Protected>} />
      <Route path="/agent/customers" element={<Protected roles={['agent']}><RoleShell role="agent"><Customers /></RoleShell></Protected>} />
      <Route path="/agent/policies" element={<Protected roles={['agent']}><RoleShell role="agent"><Policies /></RoleShell></Protected>} />
      <Route path="/agent/claims" element={<Protected roles={['agent']}><RoleShell role="agent"><Claims /></RoleShell></Protected>} />
      <Route path="/agent/payments" element={<Protected roles={['agent']}><RoleShell role="agent"><Payments /></RoleShell></Protected>} />

      {/* Customer */}
      <Route path="/customer" element={<Protected roles={['customer']}><RoleShell role="customer"><MyPolicies /></RoleShell></Protected>} />
      <Route path="/customer/claims" element={<Protected roles={['customer']}><RoleShell role="customer"><MyClaims /></RoleShell></Protected>} />
      <Route path="/customer/payments" element={<Protected roles={['customer']}><RoleShell role="customer"><MyPayments /></RoleShell></Protected>} />
      <Route path="/customer/documents" element={<Protected roles={['customer']}><RoleShell role="customer"><MyDocuments /></RoleShell></Protected>} />

      <Route path="*" element={<Navigate to={user ? `/${user.role}` : '/login'} replace />} />
    </Routes>
  );
}
