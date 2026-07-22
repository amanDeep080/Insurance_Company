import { motion, AnimatePresence } from 'framer-motion';

export default function DataTable({ columns, rows, keyField = 'id', emptyLabel = 'Nothing to show yet.' }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b hairline bg-[var(--color-paper)]">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3 font-medium text-[var(--color-muted)] text-xs uppercase tracking-wide">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--color-muted)]">
                  {emptyLabel}
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <motion.tr
                key={row[keyField]}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
                className="border-b hairline last:border-0 hover:bg-[var(--color-paper)] transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
