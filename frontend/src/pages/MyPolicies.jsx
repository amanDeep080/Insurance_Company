import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function MyPolicies() {
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    api.get('/policies').then((r) => setPolicies(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--color-ink)] mb-1">My policies</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">Your active and past insurance policies.</p>

      {policies.length === 0 && (
        <div className="card p-8 text-center text-[var(--color-muted)] text-sm">
          You don't have any policies yet. Your agent will set these up for you.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {policies.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-ink)] flex items-center justify-center">
                <ShieldCheck size={18} className="text-[var(--color-brass)]" />
              </div>
              <StatusBadge status={p.status} />
            </div>
            <p className="font-display text-lg text-[var(--color-ink)]">{p.policyType} insurance</p>
            <p className="text-xs text-[var(--color-muted)] font-tabular mb-3">{p.policyNumber}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-[var(--color-muted)]">Premium</p>
                <p className="text-[var(--color-ink)]">₹{Number(p.premiumAmount).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)]">Sum assured</p>
                <p className="text-[var(--color-ink)]">{p.sumAssured ? `₹${Number(p.sumAssured).toLocaleString('en-IN')}` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)]">Valid until</p>
                <p className="text-[var(--color-ink)]">{new Date(p.endDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
