import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, FileText, ShieldCheck, Wallet, FolderOpen, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/approvals', label: 'Approvals', icon: UserPlus },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/policies', label: 'Policies', icon: ShieldCheck },
    { to: '/admin/claims', label: 'Claims', icon: FileText },
    { to: '/admin/payments', label: 'Payments', icon: Wallet },
  ],
  agent: [
    { to: '/agent', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/agent/customers', label: 'Customers', icon: Users },
    { to: '/agent/policies', label: 'Policies', icon: ShieldCheck },
    { to: '/agent/claims', label: 'Claims', icon: FileText },
    { to: '/agent/payments', label: 'Payments', icon: Wallet },
  ],
  customer: [
    { to: '/customer', label: 'My policies', icon: ShieldCheck, end: true },
    { to: '/customer/claims', label: 'My claims', icon: FileText },
    { to: '/customer/payments', label: 'My payments', icon: Wallet },
    { to: '/customer/documents', label: 'Documents', icon: FolderOpen },
  ],
};

export default function AppShell({ children, role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV[role] || [];

  return (
    <div className="min-h-screen flex bg-[var(--color-paper)]">
      <aside className="w-64 shrink-0 bg-[var(--color-ink)] text-white flex flex-col">
        <div className="px-6 py-6 border-b" style={{ borderColor: 'var(--color-line-dark)' }}>
          <p className="font-display text-lg tracking-wide">Suraksha Cover</p>
          <p className="text-xs text-[var(--color-brass-soft)] mt-0.5 capitalize">{role} portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'text-white' : 'text-[var(--color-brass-soft)] hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-[var(--color-ink-2)] border-l-2"
                      style={{ borderColor: 'var(--color-brass)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <item.icon size={17} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--color-line-dark)' }}>
          <div className="px-3 py-2 mb-1">
            <p className="text-sm text-white truncate">{user?.name}</p>
            <p className="text-xs text-[var(--color-brass-soft)] truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-brass-soft)] hover:text-white hover:bg-white/5 transition-colors focus-ring"
          >
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
