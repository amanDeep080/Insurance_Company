import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Search, Clock, UserCheck, UserX, AlertCircle } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';

export default function Approvals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null); // User being rejected
  const [reason, setReason] = useState('');

  function load() {
    api.get('/auth/pending')
      .then(r => setPending(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleApprove(id) {
    if (!confirm('Approve this user? They will gain immediate access to the platform.')) return;
    try {
      await api.post(`/auth/approve/${id}`);
      load();
    } catch (err) { alert('Approval failed'); }
  }

  async function handleReject(e) {
    e.preventDefault();
    try {
      await api.post(`/auth/reject/${reviewing.id}`, { reason });
      setReviewing(null);
      setReason('');
      load();
    } catch (err) { alert('Rejection failed'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-[var(--color-ink)] mb-1">Registration Queue</h1>
          <p className="text-sm text-[var(--color-muted)]">Review and approve new platform account requests.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
           <Clock size={16} />
           <span className="text-xs font-bold uppercase tracking-wider">{pending.length} Pending</span>
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'name', label: 'Requester', render: r => (
            <div>
              <p className="font-medium text-[var(--color-ink)]">{r.name}</p>
              <p className="text-[10px] text-[var(--color-muted)] font-tabular uppercase">{r.role}</p>
            </div>
          )},
          { key: 'email', label: 'Contact', render: r => (
            <div>
              <p className="text-sm">{r.email}</p>
              <p className="text-xs text-[var(--color-muted)]">{r.phone}</p>
            </div>
          )},
          { key: 'createdAt', label: 'Requested On', render: r => new Date(r.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) },
          { key: 'actions', label: 'Review', className: 'text-right', render: r => (
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => handleApprove(r.id)}
                className="w-9 h-9 rounded-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all flex items-center justify-center shadow-sm border border-green-100"
                title="Approve User"
              >
                <UserCheck size={18} />
              </button>
              <button
                onClick={() => setReviewing(r)}
                className="w-9 h-9 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-sm border border-red-100"
                title="Reject User"
              >
                <UserX size={18} />
              </button>
            </div>
          )},
        ]}
        rows={pending}
        emptyLabel="Great job! The registration queue is completely empty."
      />

      <AnimatePresence>
        {reviewing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onSubmit={handleReject}
              className="card p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h2 className="font-display text-xl text-[var(--color-ink)]">Reject Application</h2>
                  <p className="text-sm text-[var(--color-muted)]">User: {reviewing.name} ({reviewing.email})</p>
                </div>
              </div>

              <label className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-muted)] mb-2 block">Reason for Rejection</label>
              <textarea
                required autoFocus
                value={reason} onChange={e => setReason(e.target.value)}
                placeholder="e.g., Incomplete documentation, suspicious email address..."
                className="w-full h-32 p-4 rounded-xl border hairline focus:ring-4 focus:ring-red-50 focus:border-red-300 outline-none text-sm transition-all"
              />

              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  type="button" onClick={() => { setReviewing(null); setReason(''); }}
                  className="py-3 rounded-xl border border-gray-100 font-semibold text-[var(--color-muted)] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
