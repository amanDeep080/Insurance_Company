import { useEffect, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function Payments() {
  const [payments, setPayments] = useState([]);

  function load() {
    api.get('/payments').then((r) => setPayments(r.data)).catch(() => {});
  }
  useEffect(load, []);

  async function markPaid(id) {
    try {
      await api.patch(`/payments/${id}/pay`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment.');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--color-ink)] mb-1">Premium payments</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">Track due, paid, and overdue premium payments.</p>

      <DataTable
        columns={[
          { key: 'policyNumber', label: 'Policy #', render: (r) => <span className="font-tabular">{r.policyNumber}</span> },
          { key: 'customerName', label: 'Customer' },
          { key: 'amount', label: 'Amount', render: (r) => `₹${Number(r.amount).toLocaleString('en-IN')}` },
          { key: 'dueDate', label: 'Due', render: (r) => new Date(r.dueDate).toLocaleDateString('en-IN') },
          { key: 'paymentStatus', label: 'Status', render: (r) => <StatusBadge status={r.paymentStatus} /> },
          {
            key: 'actions', label: '', render: (r) => (
              r.paymentStatus !== 'paid' ? (
                <button onClick={() => markPaid(r.id)} className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-success-bg)] text-[var(--color-success)] hover:brightness-95">
                  Mark paid
                </button>
              ) : null
            )
          },
        ]}
        rows={payments}
        emptyLabel="No payments recorded yet."
      />
    </div>
  );
}
