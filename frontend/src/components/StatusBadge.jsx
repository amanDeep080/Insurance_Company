const STYLES = {
  active: { bg: 'var(--color-success-bg)', color: 'var(--color-success)', label: 'Active' },
  approved: { bg: 'var(--color-success-bg)', color: 'var(--color-success)', label: 'Approved' },
  paid: { bg: 'var(--color-success-bg)', color: 'var(--color-success)', label: 'Paid' },
  pending: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', label: 'Pending' },
  due: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', label: 'Due' },
  under_review: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', label: 'Under review' },
  rejected: { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', label: 'Rejected' },
  overdue: { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', label: 'Overdue' },
  expired: { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', label: 'Expired' },
  cancelled: { bg: '#EEECE6', color: 'var(--color-muted)', label: 'Cancelled' },
};

export default function StatusBadge({ status }) {
  const s = STYLES[status] || { bg: '#EEECE6', color: 'var(--color-muted)', label: status };
  const isApproved = status === 'approved';
  const isPending = status === 'pending' || status === 'due';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isApproved ? 'stamp-approved' : ''} ${isPending ? 'animate-pulse' : ''}`}
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
