import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CreditCard, Landmark, QrCode, ShieldCheck, CheckCircle2, Loader2, X } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [paying, setPaying] = useState(null); // The payment object being paid
  const [gatewayStep, setGatewayStep] = useState('select'); // 'select' | 'card' | 'upi' | 'processing' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('');

  function load() {
    api.get('/payments').then((r) => setPayments(r.data)).catch(() => {});
  }
  useEffect(load, []);

  async function handleFinalPay() {
    setGatewayStep('processing');
    try {
      // Simulate network delay for "Real Feel"
      await new Promise(r => setTimeout(r, 2000));
      await api.patch(`/payments/${paying.id}/pay`);
      setGatewayStep('success');
      setTimeout(() => {
        setPaying(null);
        setGatewayStep('select');
        load();
      }, 2500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment.');
      setPaying(null);
      setGatewayStep('select');
    }
  }

  const totalDue = payments.filter((p) => p.paymentStatus !== 'paid').reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <h1 className="font-display text-2xl text-[var(--color-ink)] mb-1">My payments</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">Your premium payment history and upcoming dues.</p>

      {totalDue > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="card p-5 mb-6 flex items-center gap-4"
          style={{ borderColor: 'var(--color-warning)' }}
        >
          <div className="w-10 h-10 rounded-full bg-[var(--color-warning-bg)] flex items-center justify-center shrink-0">
            <Wallet size={18} className="text-[var(--color-warning)]" />
          </div>
          <div>
            <p className="text-sm text-[var(--color-ink)]">You have ₹{totalDue.toLocaleString('en-IN')} in pending premiums.</p>
            <p className="text-xs text-[var(--color-muted)]">Pay before the due date to keep your policy active.</p>
          </div>
        </motion.div>
      )}

      <DataTable
        columns={[
          { key: 'policyNumber', label: 'Policy #', render: (r) => <span className="font-tabular">{r.policyNumber}</span> },
          { key: 'amount', label: 'Amount', render: (r) => `₹${Number(r.amount).toLocaleString('en-IN')}` },
          { key: 'dueDate', label: 'Due', render: (r) => new Date(r.dueDate).toLocaleDateString('en-IN') },
          { key: 'paymentStatus', label: 'Status', render: (r) => <StatusBadge status={r.paymentStatus} /> },
          {
            key: 'actions', label: '', render: (r) => (
              r.paymentStatus !== 'paid' ? (
                <button
                  onClick={() => { setPaying(r); setGatewayStep('select'); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-2)] transition-colors focus-ring"
                >
                  Pay now
                </button>
              ) : null
            )
          },
        ]}
        rows={payments}
        emptyLabel="No premium payments recorded yet."
      />

      {/* --- MOCK PAYMENT GATEWAY MODAL --- */}
      <AnimatePresence>
        {paying && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => gatewayStep !== 'processing' && setPaying(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gateway Header */}
              <div className="bg-[var(--color-ink)] p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-[var(--color-brass)]" size={20} />
                  <span className="font-display tracking-tight">Secure Payment</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest opacity-60">Amount to Pay</p>
                  <p className="text-lg font-tabular font-semibold">₹{Number(paying.amount).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="p-6">
                {gatewayStep === 'select' && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-4">Choose Payment Method</h3>
                    <div className="space-y-3">
                      {[
                        { id: 'card', icon: CreditCard, label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay' },
                        { id: 'upi', icon: QrCode, label: 'UPI App', sub: 'Google Pay, PhonePe, Paytm' },
                        { id: 'net', icon: Landmark, label: 'Net Banking', sub: 'All major Indian banks' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { setPaymentMethod(m.id); setGatewayStep(m.id === 'net' ? 'processing' : m.id); }}
                          className="w-full flex items-center gap-4 p-4 rounded-xl border hairline hover:bg-gray-50 transition-colors text-left group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors">
                            <m.icon size={20} className="text-[var(--color-muted)]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[var(--color-ink)]">{m.label}</p>
                            <p className="text-xs text-[var(--color-muted)]">{m.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {gatewayStep === 'card' && (
                  <form onSubmit={(e) => { e.preventDefault(); handleFinalPay(); }} className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <button type="button" onClick={() => setGatewayStep('select')} className="text-xs text-[var(--color-muted)] hover:text-black">← Back</button>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 opacity-50" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400">Card Number</label>
                      <input required placeholder="4242 4242 4242 4242" maxLength={19} className="w-full mt-1 p-3 rounded-lg border hairline outline-none focus:border-[var(--color-brass)] font-tabular" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400">Expiry Date</label>
                        <input required placeholder="MM/YY" maxLength={5} className="w-full mt-1 p-3 rounded-lg border hairline outline-none focus:border-[var(--color-brass)] font-tabular" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400">CVV</label>
                        <input required type="password" placeholder="•••" maxLength={3} className="w-full mt-1 p-3 rounded-lg border hairline outline-none focus:border-[var(--color-brass)] font-tabular" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 rounded-xl bg-[var(--color-ink)] text-white font-semibold text-sm hover:brightness-110 shadow-lg shadow-black/10 transition mt-2">
                      Pay ₹{Number(paying.amount).toLocaleString('en-IN')}
                    </button>
                  </form>
                )}

                {gatewayStep === 'upi' && (
                  <div className="space-y-5 text-center">
                    <div className="flex justify-start">
                       <button type="button" onClick={() => setGatewayStep('select')} className="text-xs text-[var(--color-muted)] hover:text-black">← Back</button>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-2xl inline-block mx-auto border border-dashed border-gray-300">
                      <QrCode size={140} className="text-[var(--color-ink)] opacity-80" />
                    </div>
                    <p className="text-sm text-[var(--color-muted)]">Scan QR code using any UPI app</p>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or enter UPI ID</span></div>
                    </div>
                    <input placeholder="username@okaxis" className="w-full p-3 rounded-lg border hairline outline-none focus:border-[var(--color-brass)] text-center font-medium" />
                    <button onClick={handleFinalPay} className="w-full py-4 rounded-xl bg-[var(--color-ink)] text-white font-semibold text-sm hover:brightness-110 transition">
                      Verify & Pay
                    </button>
                  </div>
                )}

                {gatewayStep === 'processing' && (
                  <div className="py-12 text-center space-y-4">
                    <Loader2 size={48} className="text-[var(--color-brass)] animate-spin mx-auto" />
                    <div>
                      <p className="text-lg font-display text-[var(--color-ink)]">Processing Transaction</p>
                      <p className="text-sm text-[var(--color-muted)]">Please do not refresh or close this window.</p>
                    </div>
                  </div>
                )}

                {gatewayStep === 'success' && (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="py-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={40} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xl font-display text-green-700">Payment Successful!</p>
                      <p className="text-sm text-[var(--color-muted)]">Premium for {paying.policyNumber} has been received.</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Secure Footer */}
              <div className="p-4 bg-gray-50 flex items-center justify-center gap-6 border-t hairline">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-3 grayscale opacity-40" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 grayscale opacity-40" />
                 <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">PCI DSS COMPLIANT</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
