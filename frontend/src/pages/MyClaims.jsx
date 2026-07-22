import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ policyId: '', claimAmount: '', reason: '' });
  const [saving, setSaving] = useState(false);

  function load() {
    api.get('/claims').then((r) => setClaims(r.data)).catch(() => {});
    api.get('/policies').then((r) => setPolicies(r.data)).catch(() => {});
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/claims', form);
      setShowForm(false);
      setForm({ policyId: '', claimAmount: '', reason: '' });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-ink)] mb-1">My claims</h1>
          <p className="text-sm text-[var(--color-muted)]">Submit and track your insurance claims.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-sm font-medium hover:bg-[var(--color-ink-2)] transition-colors focus-ring">
          <Plus size={16} /> Submit claim
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'policyNumber', label: 'Policy #', render: (r) => <span className="font-tabular">{r.policyNumber}</span> },
          { key: 'claimAmount', label: 'Amount', render: (r) => `₹${Number(r.claimAmount).toLocaleString('en-IN')}` },
          { key: 'reason', label: 'Reason' },
          { key: 'submissionDate', label: 'Submitted', render: (r) => new Date(r.submissionDate).toLocaleDateString('en-IN') },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
        rows={claims}
        emptyLabel="You haven't submitted any claims yet."
      />

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
            <motion.form initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="card p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-[var(--color-ink)]">Submit a claim</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-[var(--color-muted)] hover:text-[var(--color-ink)]"><X size={18} /></button>
              </div>

              <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Policy</label>
              <select required value={form.policyId} onChange={(e) => setForm({ ...form, policyId: e.target.value })}
                className="w-full mt-1 mb-3 px-3 py-2 rounded-lg border hairline focus-ring outline-none text-sm bg-white">
                <option value="">Select policy…</option>
                {policies.map((p) => <option key={p.id} value={p.id}>{p.policyNumber} — {p.policyType}</option>)}
              </select>

              <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Claim amount (₹)</label>
              <input type="number" required value={form.claimAmount} onChange={(e) => setForm({ ...form, claimAmount: e.target.value })}
                className="w-full mt-1 mb-3 px-3 py-2 rounded-lg border hairline focus-ring outline-none text-sm" />

              <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Reason</label>
              <textarea required rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full mt-1 mb-4 px-3 py-2 rounded-lg border hairline focus-ring outline-none text-sm resize-none" />

              <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg bg-[var(--color-brass)] text-white text-sm font-medium hover:brightness-95 transition disabled:opacity-60">
                {saving ? 'Submitting…' : 'Submit claim'}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
