import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { loginVerify } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer' });
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleDetailsSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/signup/start', form);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Email might be in use.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/signup/verify', { ...form, code });
      // Use existing loginVerify logic to set local storage and user context
      localStorage.setItem('sc_token', res.data.token);
      localStorage.setItem('sc_user', JSON.stringify(res.data.user));
      window.location.href = '/status';
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-ink)] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 justify-center mb-8">
          <ShieldCheck className="text-[var(--color-brass)]" size={26} />
          <span className="font-display text-2xl text-white tracking-wide">Suraksha Cover</span>
        </div>

        <div className="card p-8">
          <AnimatePresence mode="wait">
            {step === 'details' ? (
              <motion.form
                key="details" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onSubmit={handleDetailsSubmit}
              >
                <h1 className="font-display text-2xl mb-1 text-[var(--color-ink)]">Create account</h1>
                <p className="text-sm text-[var(--color-muted)] mb-6">Join the platform to manage your insurance.</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Account Type</label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {['customer', 'agent'].map(r => (
                        <button
                          key={r} type="button"
                          onClick={() => setForm({...form, role: r})}
                          className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${form.role === r ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]' : 'bg-white text-[var(--color-muted)] border-gray-200 hover:border-[var(--color-brass)]'}`}
                        >
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Field label="Full Name" icon={User} value={form.name} onChange={v => setForm({...form, name: v})} placeholder="Amandeep Kumar" />
                  <Field label="Email Address" icon={Mail} type="email" value={form.email} onChange={v => setForm({...form, email: v})} placeholder="you@example.com" />
                  <Field label="Phone Number" icon={Phone} value={form.phone} onChange={v => setForm({...form, phone: v})} placeholder="9876543210" />
                  <Field label="Password" icon={Lock} type="password" value={form.password} onChange={v => setForm({...form, password: v})} placeholder="••••••••" />
                </div>

                {error && <p className="text-sm text-[var(--color-danger)] mt-4">{error}</p>}

                <button
                  type="submit" disabled={loading}
                  className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-ink)] text-white font-semibold hover:bg-[var(--color-ink-2)] transition-all disabled:opacity-60"
                >
                  {loading ? 'Sending code...' : 'Create Account'} <ArrowRight size={18} />
                </button>

                <p className="text-sm text-center mt-6 text-[var(--color-muted)]">
                  Already have an account? <Link to="/login" className="text-[var(--color-brass)] font-semibold hover:underline">Sign in</Link>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="otp" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                onSubmit={handleOtpSubmit}
              >
                <div className="w-12 h-12 bg-[var(--color-brass-bg)] rounded-full flex items-center justify-center mb-4">
                   <Mail className="text-[var(--color-brass)]" size={24} />
                </div>
                <h1 className="font-display text-2xl mb-1 text-[var(--color-ink)]">Verify email</h1>
                <p className="text-sm text-[var(--color-muted)] mb-8">
                  We've sent a verification code to <strong>{form.email}</strong>. Please enter it below.
                </p>

                <input
                  type="text" inputMode="numeric" maxLength={6} required autoFocus
                  value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-[var(--color-brass)] outline-none text-2xl tracking-[0.5em] text-center font-tabular transition-all"
                />

                {error && <p className="text-sm text-[var(--color-danger)] mt-4">{error}</p>}

                <button
                  type="submit" disabled={loading}
                  className="w-full mt-8 py-3 rounded-xl bg-[var(--color-brass)] text-white font-semibold hover:brightness-105 transition-all disabled:opacity-60 shadow-lg shadow-brass/20"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <button
                  type="button" onClick={() => setStep('details')}
                  className="w-full mt-4 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
                >
                  ← Use a different email
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, icon: Icon, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">{label}</label>
      <div className="relative mt-1.5">
        <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={type} required value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[var(--color-brass)] focus:ring-4 focus:ring-brass/5 outline-none text-sm transition-all"
        />
      </div>
    </div>
  )
}
