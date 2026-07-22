import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '', dob: '' });
  const [saving, setSaving] = useState(false);

  function load() {
    api.get('/customers', { params: search ? { search } : {} }).then((r) => setCustomers(r.data)).catch(() => {});
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/customers', form);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', phone: '', address: '', dob: '' });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create customer.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-ink)] mb-1">Customers</h1>
          <p className="text-sm text-[var(--color-muted)]">Register and manage customer records.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-ink)] text-white text-sm font-medium hover:bg-[var(--color-ink-2)] transition-colors focus-ring"
        >
          <Plus size={16} /> Register customer
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border hairline focus-ring outline-none text-sm bg-white"
        />
      </div>

      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'createdAt', label: 'Registered', render: (r) => new Date(r.createdAt).toLocaleDateString('en-IN') },
        ]}
        rows={customers}
        emptyLabel="No customers registered yet."
      />

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleCreate}
              className="card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-[var(--color-ink)]">Register customer</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['name', 'email', 'password', 'phone'].map((field) => (
                  <div key={field} className="mb-3">
                    <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide capitalize">{field}</label>
                    <input
                      required={field !== 'phone'}
                      type={field === 'password' ? 'password' : 'text'}
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      placeholder={field === 'password' ? '••••••••' : ''}
                      className="w-full mt-1 px-3 py-2 rounded-lg border hairline focus-ring outline-none text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border hairline focus-ring outline-none text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">Date of birth</label>
                <input
                  type="date" value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border hairline focus-ring outline-none text-sm"
                />
              </div>
              <button
                type="submit" disabled={saving}
                className="w-full py-2.5 rounded-lg bg-[var(--color-brass)] text-white text-sm font-medium hover:brightness-95 transition disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save customer'}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
