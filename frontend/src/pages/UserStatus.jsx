import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Clock, XCircle, LogOut, Mail, User, Phone, Briefcase } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UserStatus() {
  const { logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/status')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (data?.status === 'ACTIVE') {
    window.location.href = `/${data.role}`;
    return null;
  }

  const isPending = data?.status === 'PENDING';
  const isRejected = data?.status === 'REJECTED';

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="card p-0 overflow-hidden">
          {/* Header */}
          <div className={`p-8 text-white flex flex-col items-center text-center ${isPending ? 'bg-[var(--color-ink)]' : 'bg-red-900'}`}>
            {isPending ? (
              <Clock size={48} className="text-[var(--color-brass)] mb-4 animate-pulse" />
            ) : (
              <XCircle size={48} className="text-red-300 mb-4" />
            )}
            <h1 className="font-display text-2xl mb-2">
              {isPending ? 'Application Under Review' : 'Application Rejected'}
            </h1>
            <p className="text-sm opacity-80 max-w-xs">
              {isPending
                ? "Your registration is currently being reviewed by our administrative team. We'll notify you once it's approved."
                : "Unfortunately, your application for a Suraksha Cover account could not be approved at this time."}
            </p>
          </div>

          <div className="p-8">
            {isRejected && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-8 text-red-800">
                <p className="text-xs uppercase font-bold tracking-wider mb-1 opacity-60">Rejection Reason</p>
                <p className="text-sm leading-relaxed">{data.rejectionReason || "No specific reason provided."}</p>
                <button
                  onClick={() => alert('Feature coming soon: resubmit registration')}
                  className="mt-4 text-sm font-semibold underline hover:text-red-900"
                >
                  Edit details and resubmit
                </button>
              </div>
            )}

            <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--color-muted)] mb-4">Submitted Information</h3>
            <div className="grid grid-cols-2 gap-y-6">
               <Info label="Full Name" icon={User} value={data.name} />
               <Info label="Email Address" icon={Mail} value={data.email} />
               <Info label="Phone Number" icon={Phone} value={data.phone} />
               <Info label="Requested Role" icon={Briefcase} value={data.role.toUpperCase()} />
            </div>

            <div className="mt-10 pt-8 border-t hairline flex items-center justify-between">
              <p className="text-xs text-[var(--color-muted)] font-medium">
                Submitted on {new Date(data.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </p>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)] hover:text-red-600 transition-colors"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Info({ label, icon: Icon, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-[var(--color-muted)]" />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted)] mb-0.5 opacity-60">{label}</p>
        <p className="text-sm font-medium text-[var(--color-ink)]">{value || '—'}</p>
      </div>
    </div>
  )
}
