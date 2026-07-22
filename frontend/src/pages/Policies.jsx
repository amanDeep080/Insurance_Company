import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerId: '', policyType: 'Health', premiumAmount: '', sumAssured: '', startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);

  function load() {
    api.get('/policies').then((r) => setPolicies(r.data)).catch(() => {});
    api.get('/customers').then((r) => setCustomers(r.data)).catch(() => {});
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/policies', form);
      setShowForm(false);
      setForm({ customerId: '', policyType: 'Health', premiumAmount: '', sumAssured: '', startDate: '', endDate: '' });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create policy.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-ink)] mb-1">Policies</h1>
          <p className="text-sm text-[var(--color-muted)]">Create and track insurance policies.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-sm font-medium hover:bg-[var(--color-ink-2)] transition-colors focus-ring">
          <Plus size={16} /> New policy
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'policyNumber', label: 'Policy #', render: (r) => <span className="font-tabular">{r.policyNumber}</span> },
          { key: 'customerName', label: 'Customer' },
          { key: 'policyType', label: 'Type' },
          { key: 'premiumAmount', label: 'Premium', render: (r) => `₹${Number(r.premiumAmount).toLocaleString('en-IN')}` },
          { key: 'endDate', label: 'Expires', render: (r) => new Date(r.endDate).toLocaleDateString('en-IN') },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
        rows={policies}
        emptyLabel="No policies created yet."
      />

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
            <motion.form initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()} onSubmit={handleCreate} className="card p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-[var(--color-ink)]">New policy</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-[var(--color-muted)] hover:text-[var(--color-ink)]"><X size={18} /></button>
              </div>

              <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Customer</label>
              <select required value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                className="w-full mt-1 mb-3 px-3 py-2 rounded-lg border hairline focus-ring outline-none text-sm bg-white">
                <option value="">Select customer…</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Policy type</label>
              <select value={form.policyType} onChange={(e) => setForm({ ...form, policyType: e.target.value })}
                className="w-full mt-1 mb-3 px-3 py-2 rounded-lg border hairline focus-ring outline-none text-sm bg-white">
                {['Health', 'Motor', 'Life', 'Home', 'Travel'].map((t) => <option key={t}>{t}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Premium (₹)</label>
                  <input type="number" required value={form.premiumAmount} onChange={(e) => setForm({ ...form, premiumAmount: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border hairline focus-ring outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Sum assured (₹)</label>
                  <input type="number" value={form.sumAssured} onChange={(e) => setForm({ ...form, sumAssured: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border hairline focus-ring outline-none text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Start date</label>
                  <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border hairline focus-ring outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">End date</label>
                  <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border hairline focus-ring outline-none text-sm" />
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg bg-[var(--color-brass)] text-white text-sm font-medium hover:brightness-95 transition disabled:opacity-60">
                {saving ? 'Creating…' : 'Create policy'}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
