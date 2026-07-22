import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

function CountUp({ value, prefix = '', decimals = 0 }) {
  const [display, setDisplay] = useState('0');
  const mv = useMotionValue(0);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return controls.stop;
  }, [value]);

  return <span className="font-tabular">{prefix}{Number(display).toLocaleString('en-IN')}</span>;
}

export default function StatCard({ label, value, prefix = '', decimals = 0, index = 0, accent = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      className="card p-5"
    >
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2">{label}</p>
      <p className={`text-2xl font-display font-medium ${accent ? 'text-[var(--color-brass)]' : 'text-[var(--color-ink)]'}`}>
        <CountUp value={value} prefix={prefix} decimals={decimals} />
      </p>
    </motion.div>
  );
}
