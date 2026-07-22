import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function Claims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const canReview = user?.role === 'admin' || user?.role === 'agent';

  function load() {
    api.get('/claims').then((r) => setClaims(r.data)).catch(() => {});
  }
  useEffect(load, []);

  async function review(id, status) {
    try {
      await api.patch(`/claims/${id}/review`, { status });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update claim.');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--color-ink)] mb-1">Claims</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">Review submitted claims and verify supporting documents.</p>

      <DataTable
        columns={[
          { key: 'policyNumber', label: 'Policy #', render: (r) => <span className="font-tabular">{r.policyNumber}</span> },
          { key: 'customerName', label: 'Customer' },
          { key: 'claimAmount', label: 'Amount', render: (r) => `₹${Number(r.claimAmount).toLocaleString('en-IN')}` },
          { key: 'reason', label: 'Reason' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ...(canReview ? [{
            key: 'actions', label: '', render: (r) => (
              r.status === 'pending' || r.status === 'under_review' ? (
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.94 }} onClick={() => review(r.id, 'approved')}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-success-bg)] text-[var(--color-success)] hover:brightness-95">
                    Approve
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.94 }} onClick={() => review(r.id, 'rejected')}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-danger-bg)] text-[var(--color-danger)] hover:brightness-95">
                    Reject
                  </motion.button>
                </div>
              ) : null
            )
          }] : [])
        ]}
        rows={claims}
        emptyLabel="No claims submitted yet."
      />
    </div>
  );
}
