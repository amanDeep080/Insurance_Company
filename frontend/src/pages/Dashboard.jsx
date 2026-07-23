import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import api from '../services/api';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);

  useEffect(() => {
    api.get('/reports/summary').then((r) => setSummary(r.data)).catch(() => {});
    api.get('/reports/premiums/monthly').then((r) => setMonthly(r.data)).catch(() => {});
    api.get('/claims').then((r) => setRecentClaims(r.data.slice(0, 6))).catch(() => {});
  }, []);

  const chartData = {
    labels: monthly.map((m) => m.month),
    datasets: [{ data: monthly.map((m) => Number(m.total)), backgroundColor: '#C99A3D', borderRadius: 4, maxBarThickness: 28 }],
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--color-ink)] mb-1">Dashboard</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">A live snapshot of policies, claims, and premium collection.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="Active policies" value={summary?.activePolicies ?? 0} index={0} />
        <StatCard label="Premium collected" value={summary?.premiumCollected ?? 0} prefix="₹" index={1} accent />
        <StatCard label="Pending claims" value={summary?.pendingClaims ?? 0} index={2} />
        <StatCard label="Customers" value={summary?.customerCount ?? 0} index={3} />
        <Link to="/admin/approvals">
          <StatCard label="Pending approvals" value={summary?.pendingApprovals ?? 0} index={4} />
        </Link>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-2 card p-5">
          <p className="text-sm font-medium text-[var(--color-ink)] mb-4">Recent claims</p>
          <div className="space-y-1">
            {recentClaims.length === 0 && <p className="text-sm text-[var(--color-muted)]">No claims submitted yet.</p>}
            {recentClaims.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between py-2.5 border-b hairline last:border-0" style={{ animationDelay: `${i * 0.05}s` }}>
                <div>
                  <p className="text-sm text-[var(--color-ink)]">{c.customerName}</p>
                  <p className="text-xs text-[var(--color-muted)] font-tabular">{c.policyNumber}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-3 card p-5">
          <p className="text-sm font-medium text-[var(--color-ink)] mb-4">Premium collection (monthly)</p>
          <div className="h-56">
            {monthly.length > 0 ? (
              <Bar
                data={chartData}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  animation: { duration: 900, easing: 'easeOutQuart' },
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { color: '#E4E0D6' }, ticks: { color: '#7C818C', callback: (v) => '₹' + v / 1000 + 'k' } },
                    x: { grid: { display: false }, ticks: { color: '#7C818C' } },
                  },
                }}
              />
            ) : (
              <p className="text-sm text-[var(--color-muted)]">No paid premiums recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
